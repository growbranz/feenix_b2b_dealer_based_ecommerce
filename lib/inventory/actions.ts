"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile, requireAdmin } from "@/lib/auth/auth.helpers"
import { notifyOnInventoryLow, notifyOnOutOfStock } from "@/lib/notifications/notifier"
import type { Inventory, InventoryTransfer } from "@/types"
import type { StockAdjustmentInput, StockThresholdInput, InventoryTransferInput } from "@/lib/inventory/validations"

async function getInventoryRow(
  productId: string,
  dealerId?: string | null,
  warehouseId?: string | null
): Promise<Inventory | null> {
  const supabase: any = await createServerClient()
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("product_id", productId)
    .eq("dealer_id", dealerId || null)
    .eq("warehouse_id", warehouseId || null)
    .single()

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

export async function adjustStock(input: StockAdjustmentInput) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const supabase: any = await createServerClient()
  const existing = await getInventoryRow(input.productId, input.dealerId, input.warehouseId)
  if (!existing) throw new Error("Inventory record not found")

  const currentAvailable = existing.available_stock
  const currentReserved = existing.reserved_stock
  let newAvailable = currentAvailable

  if (input.adjustmentType === "set") {
    newAvailable = input.quantity
  } else if (input.adjustmentType === "add") {
    newAvailable = currentAvailable + input.quantity
  } else if (input.adjustmentType === "subtract") {
    newAvailable = currentAvailable - input.quantity
  }

  if (newAvailable < 0) {
    throw new Error("Insufficient stock for adjustment")
  }

  const { error } = await supabase
    .from("inventory")
    .update({ available_stock: newAvailable })
    .eq("id", existing.id)

  if (error) throw error

  await insertLedger(
    input.productId,
    currentAvailable,
    newAvailable,
    currentReserved,
    currentReserved,
    input.movementType,
    input.reason,
    userProfile.user.id,
    input.dealerId,
    input.warehouseId
  )

  revalidatePath("/admin/inventory")
  revalidatePath("/admin/inventory/history")
  revalidatePath("/admin/inventory/adjustments")
  revalidatePath("/dealer/inventory")
  revalidatePath("/dealer/inventory/history")

  try {
    const { data: product } = await supabase.from("products").select("title").eq("id", input.productId).single()
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
  await requireAdmin()

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
  const { user } = await requireAdmin()
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

  revalidatePath("/admin/inventory/transfers")
  revalidatePath("/admin/inventory")
  revalidatePath("/dealer/inventory")
}

export async function rejectTransfer(transferId: string) {
  await requireAdmin()
  const supabase: any = await createServerClient()

  const { error } = await supabase
    .from("inventory_transfers")
    .update({ status: "REJECTED" })
    .eq("id", transferId)

  if (error) throw error

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
