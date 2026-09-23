"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile, requireAdmin } from "@/lib/auth/auth.helpers"
import { notifyOnInventoryLow, notifyOnOutOfStock } from "@/lib/notifications/notifier"
import { logActivity } from "@/lib/activity/service"
import type { Inventory, InventoryTransfer } from "@/types"
import type { StockAdjustmentInput, StockThresholdInput, InventoryTransferInput } from "@/lib/inventory/validations"

async function getInventoryRow(
  productId: string,
  dealerId?: string | null,
  warehouseId?: string | null
): Promise<Inventory | null> {
  const supabase: any = await createServerClient()
  let query = supabase.from("inventory").select("*").eq("product_id", productId)
  if (dealerId) {
    query = query.eq("dealer_id", dealerId)
  } else {
    query = query.is("dealer_id", null)
  }
  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId)
  } else {
    query = query.is("warehouse_id", null)
  }
  const { data, error } = await query.single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as Inventory | null
}

async function upsertInventory(
  productId: string,
  dealerId: string | null,
  warehouseId: string | null,
  availableDelta: number,
  reservedDelta: number,
  lowStockLimit: number,
  criticalStockLimit: number,
  recommendedReorderLevel: number
): Promise<Inventory> {
  const supabase: any = await createServerClient()

  const existing = await getInventoryRow(productId, dealerId, warehouseId)

  if (existing) {
    const newAvailable = Math.max(0, existing.available_stock + availableDelta)
    const newReserved = Math.max(0, existing.reserved_stock + reservedDelta)
    const { data, error } = await supabase
      .from("inventory")
      .update({
        available_stock: newAvailable,
        reserved_stock: newReserved,
        low_stock_limit: lowStockLimit,
        critical_stock_limit: criticalStockLimit,
        recommended_reorder_level: recommendedReorderLevel,
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from("inventory")
    .insert({
      product_id: productId,
      dealer_id: dealerId,
      warehouse_id: warehouseId,
      available_stock: Math.max(0, availableDelta),
      reserved_stock: Math.max(0, reservedDelta),
      low_stock_limit: lowStockLimit,
      critical_stock_limit: criticalStockLimit,
      recommended_reorder_level: recommendedReorderLevel,
    })
    .select()
    .single()

  if (error) throw error
  return data as Inventory
}

async function insertLedger(
  productId: string,
  previousQty: number,
  updatedQty: number,
  previousReserved: number,
  updatedReserved: number,
  movementType: any,
  reason: string,
  userId: string,
  dealerId?: string | null,
  warehouseId?: string | null,
  orderId?: string | null
) {
  const supabase: any = await createServerClient()
  const { error } = await supabase.from("inventory_ledger").insert({
    product_id: productId,
    dealer_id: dealerId || null,
    warehouse_id: warehouseId || null,
    order_id: orderId || null,
    user_id: userId,
    previous_quantity: previousQty,
    updated_quantity: updatedQty,
    previous_reserved: previousReserved,
    updated_reserved: updatedReserved,
    movement_type: movementType,
    reason,
  })
  if (error) throw error
}

export async function ensureInventoryForProduct(
  productId: string,
  dealerId: string,
  initialStock: number
): Promise<Inventory> {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")
  if (dealerId !== userProfile.user.id && userProfile.profile?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const existing = await getInventoryRow(productId, dealerId, null)
  if (existing) return existing

  const supabase: any = await createServerClient()
  const { data, error } = await supabase
    .from("inventory")
    .insert({
      product_id: productId,
      dealer_id: dealerId,
      warehouse_id: null,
      available_stock: initialStock,
      reserved_stock: 0,
      low_stock_limit: 10,
      critical_stock_limit: 5,
      recommended_reorder_level: 20,
    })
    .select()
    .single()

  if (error) throw error
  return data as Inventory
}

export async function adjustStock(input: StockAdjustmentInput) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const supabase: any = await createServerClient()
  const existing = await getInventoryRow(input.productId, input.dealerId, input.warehouseId)

  if (!existing) throw new Error("Inventory record not found")

  let adjustment = 0
  if (input.adjustmentType === "add") {
    adjustment = input.quantity
  } else if (input.adjustmentType === "subtract") {
    adjustment = -input.quantity
  } else if (input.adjustmentType === "set") {
    adjustment = input.quantity - existing.available_stock
  }

  const newAvailable = Math.max(0, existing.available_stock + adjustment)
  const { error } = await supabase
    .from("inventory")
    .update({ available_stock: newAvailable })
    .eq("id", existing.id)

  if (error) throw error

  await insertLedger(
    input.productId,
    existing.available_stock,
    newAvailable,
    existing.reserved_stock,
    existing.reserved_stock,
    input.movementType,
    input.reason || "Stock adjustment",
    userProfile.user.id,
    input.dealerId,
    input.warehouseId
  )

  revalidatePath("/admin/inventory")
  revalidatePath("/dealer/inventory")
  revalidatePath("/dealer/inventory/history")

  const { data: product } = await supabase.from("products").select("title").eq("id", input.productId).single()

  await logActivity({
    type: "INVENTORY_ACTION",
    action: `Adjusted stock by ${adjustment} units (${input.adjustmentType})`,
    actor_id: userProfile.user.id,
    actor_name: userProfile.profile?.name || userProfile.user.email,
    actor_role: userProfile.profile?.role,
    target_type: "inventory",
    target_id: existing.id,
    target_name: product?.title || "Unknown",
    metadata: { 
      adjustment,
      adjustmentType: input.adjustmentType,
      quantity: input.quantity,
      movementType: input.movementType,
      reason: input.reason,
      new_available: newAvailable 
    },
  })

  try {
    if (product) {
      const inventory = { ...existing, available_stock: newAvailable }
      if (newAvailable === 0) {
        await notifyOnOutOfStock(inventory, product, userProfile.user.id)
      } else if (existing.low_stock_limit !== null && newAvailable <= existing.low_stock_limit) {
        await notifyOnInventoryLow(inventory, product, userProfile.user.id)
      }
    }
  } catch (e: any) {
    console.warn("Inventory notification warning:", e.message)
  }

  return { success: true }
}

export async function updateStockThresholds(input: StockThresholdInput) {
  const { user, profile } = await requireAdmin()
  const supabase: any = await createServerClient()
  const existing = await getInventoryRow(input.productId, input.dealerId, input.warehouseId)

  if (!existing) throw new Error("Inventory record not found")

  const { error } = await supabase
    .from("inventory")
    .update({
      low_stock_limit: input.lowStockLimit,
      critical_stock_limit: input.criticalStockLimit,
      recommended_reorder_level: input.recommendedReorderLevel,
    })
    .eq("id", existing.id)

  if (error) throw error

  const { data: product } = await supabase.from("products").select("title").eq("id", input.productId).single()

  await logActivity({
    type: "INVENTORY_ACTION",
    action: "Updated stock thresholds",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "inventory",
    target_id: existing.id,
    target_name: product?.title || "Unknown",
    metadata: { 
      low_stock_limit: input.lowStockLimit,
      critical_stock_limit: input.criticalStockLimit,
      recommended_reorder_level: input.recommendedReorderLevel 
    },
  })

  revalidatePath("/admin/inventory")
  revalidatePath("/dealer/inventory")
  return { success: true }
}

export async function createTransfer(input: InventoryTransferInput) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const supabase: any = await createServerClient()

  // Verify source inventory has enough available stock
  const source = await getInventoryRow(input.productId, input.fromDealerId, input.fromWarehouseId)
  if (!source || source.available_stock < input.quantity) {
    throw new Error("Insufficient stock at source location")
  }

  const { data, error } = await supabase
    .from("inventory_transfers")
    .insert({
      product_id: input.productId,
      from_dealer_id: input.fromDealerId || null,
      from_warehouse_id: input.fromWarehouseId || null,
      to_dealer_id: input.toDealerId || null,
      to_warehouse_id: input.toWarehouseId || null,
      quantity: input.quantity,
      requested_by: userProfile.user.id,
      status: "PENDING",
      reason: input.reason || null,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/admin/inventory/transfers")
  return { transfer: data }
}

export async function approveTransfer(transferId: string) {
  const { user, profile } = await requireAdmin()
  const supabase: any = await createServerClient()

  const { data: transfer, error: fetchError } = await supabase
    .from("inventory_transfers")
    .select("*")
    .eq("id", transferId)
    .single()

  if (fetchError || !transfer) throw new Error("Transfer not found")
  if (transfer.status !== "PENDING") throw new Error("Transfer is not pending")

  const source = await getInventoryRow(
    transfer.product_id,
    transfer.from_dealer_id,
    transfer.from_warehouse_id
  )
  if (!source || source.available_stock < transfer.quantity) {
    throw new Error("Insufficient stock at source location")
  }

  const { data: product } = await supabase.from("products").select("title").eq("id", transfer.product_id).single()

  // Move stock: source decreases, destination increases
  const dest = await getInventoryRow(
    transfer.product_id,
    transfer.to_dealer_id,
    transfer.to_warehouse_id
  )

  const { error: sourceError } = await supabase
    .from("inventory")
    .update({ available_stock: source.available_stock - transfer.quantity })
    .eq("id", source.id)

  if (sourceError) throw sourceError

  if (dest) {
    const { error: destError } = await supabase
      .from("inventory")
      .update({ available_stock: dest.available_stock + transfer.quantity })
      .eq("id", dest.id)
    if (destError) throw destError
  } else {
    await upsertInventory(
      transfer.product_id,
      transfer.to_dealer_id,
      transfer.to_warehouse_id,
      transfer.quantity,
      0,
      source.low_stock_limit,
      source.critical_stock_limit,
      source.recommended_reorder_level
    )
  }

  const { error: updateError } = await supabase
    .from("inventory_transfers")
    .update({
      status: "COMPLETED",
      approved_by: user.id,
      completed_at: new Date().toISOString(),
    })
    .eq("id", transferId)

  if (updateError) throw updateError

  await insertLedger(
    transfer.product_id,
    source.available_stock,
    source.available_stock - transfer.quantity,
    source.reserved_stock,
    source.reserved_stock,
    "TRANSFER",
    `Transfer approved: ${transfer.quantity} units`,
    user.id,
    transfer.from_dealer_id,
    transfer.from_warehouse_id
  )

  const destinationExisting = await getInventoryRow(
    transfer.product_id,
    transfer.to_dealer_id,
    transfer.to_warehouse_id
  )
  if (destinationExisting) {
    await insertLedger(
      transfer.product_id,
      destinationExisting.available_stock - transfer.quantity,
      destinationExisting.available_stock,
      destinationExisting.reserved_stock,
      destinationExisting.reserved_stock,
      "TRANSFER",
      `Transfer received: ${transfer.quantity} units`,
      user.id,
      transfer.to_dealer_id,
      transfer.to_warehouse_id
    )
  }

  await logActivity({
    type: "INVENTORY_ACTION",
    action: `Approved inventory transfer of ${transfer.quantity} units`,
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "inventory_transfer",
    target_id: transferId,
    target_name: product?.title || "Unknown",
    metadata: { 
      quantity: transfer.quantity,
      from_dealer_id: transfer.from_dealer_id,
      to_dealer_id: transfer.to_dealer_id 
    },
  })

  revalidatePath("/admin/inventory/transfers")
  revalidatePath("/admin/inventory")
  revalidatePath("/dealer/inventory")
}

export async function rejectTransfer(transferId: string) {
  const { user, profile } = await requireAdmin()
  const supabase: any = await createServerClient()

  const { data: transfer } = await supabase.from("inventory_transfers").select("*").eq("id", transferId).single()
  const { data: product } = await supabase.from("products").select("title").eq("id", transfer.product_id).single()

  const { error } = await supabase
    .from("inventory_transfers")
    .update({ status: "REJECTED" })
    .eq("id", transferId)

  if (error) throw error

  await logActivity({
    type: "INVENTORY_ACTION",
    action: "Rejected inventory transfer",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "inventory_transfer",
    target_id: transferId,
    target_name: product?.title || "Unknown",
    metadata: { 
      quantity: transfer?.quantity,
      reason: transfer?.reason 
    },
  })

  revalidatePath("/admin/inventory/transfers")
}

export async function cancelTransfer(transferId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const supabase: any = await createServerClient()

  const { data: transfer, error: fetchError } = await supabase
    .from("inventory_transfers")
    .select("*")
    .eq("id", transferId)
    .single()

  if (fetchError || !transfer) throw new Error("Transfer not found")

  if (transfer.status !== "PENDING") throw new Error("Only pending transfers can be cancelled")

  if (
    transfer.requested_by !== userProfile.user.id &&
    userProfile.profile?.role !== "ADMIN"
  ) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("inventory_transfers")
    .update({ status: "CANCELLED" })
    .eq("id", transferId)

  if (error) throw error

  revalidatePath("/admin/inventory/transfers")
  return { success: true }
}

export async function markAlertRead(alertId: string) {
  const supabase: any = await createServerClient()
  const { error } = await supabase
    .from("low_stock_alerts")
    .update({ is_read: true })
    .eq("id", alertId)

  if (error) throw error
  revalidatePath("/admin/inventory")
  revalidatePath("/dealer/inventory")
}

export async function deleteAlert(alertId: string) {
  await requireAdmin()
  const supabase: any = await createServerClient()
  const { error } = await supabase.from("low_stock_alerts").delete().eq("id", alertId)
  if (error) throw error
  revalidatePath("/admin/inventory")
}
