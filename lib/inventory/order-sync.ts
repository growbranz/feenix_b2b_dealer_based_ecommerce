"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import type { Inventory, Order } from "@/types"

const supabase = async () => (await createServerClient()) as any

async function getInventoryRow(productId: string, dealerId?: string | null, warehouseId?: string | null): Promise<Inventory | null> {
  const db = await supabase()
  const { data, error } = await db
    .from("inventory")
    .select("*")
    .eq("product_id", productId)
    .eq("dealer_id", dealerId || null)
    .eq("warehouse_id", warehouseId || null)
    .single()

  if (error?.code === "PGRST116") return null
  if (error) throw error
  return data as Inventory | null
}

async function insertLedger(
  productId: string,
  previousAvailable: number,
  updatedAvailable: number,
  previousReserved: number,
  updatedReserved: number,
  movementType: any,
  reason: string,
  userId: string,
  dealerId?: string | null,
  warehouseId?: string | null,
  orderId?: string | null
) {
  const db = await supabase()
  const { error } = await db.from("inventory_ledger").insert({
    product_id: productId,
    dealer_id: dealerId || null,
    warehouse_id: warehouseId || null,
    order_id: orderId || null,
    user_id: userId,
    previous_quantity: previousAvailable,
    updated_quantity: updatedAvailable,
    previous_reserved: previousReserved,
    updated_reserved: updatedReserved,
    movement_type: movementType,
    reason,
  })
  if (error) throw error
}

async function upsertReservation(
  orderId: string,
  productId: string,
  dealerId: string | null,
  warehouseId: string | null,
  quantity: number,
  status: "RESERVED" | "DEDUCTED" | "RELEASED" | "RETURNED"
) {
  const db = await supabase()
  const { data: existing } = await db
    .from("inventory_reservations")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing) {
    const { error } = await db
      .from("inventory_reservations")
      .update({ status, quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    if (error) throw error
    return
  }

  const { error } = await db.from("inventory_reservations").insert({
    order_id: orderId,
    product_id: productId,
    dealer_id: dealerId,
    warehouse_id: warehouseId,
    quantity,
    status,
  })
  if (error) throw error
}

async function getOrder(orderId: string): Promise<Order | null> {
  const db = await supabase()
  const { data, error } = await db.from("orders").select("*").eq("id", orderId).single()
  if (error?.code === "PGRST116") return null
  if (error) throw error
  return data as Order
}

export async function reserveStock(orderId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const inventory = await getInventoryRow(order.product_id, order.seller_id, null)
  if (!inventory || inventory.available_stock < order.quantity) {
    throw new Error("Insufficient stock to reserve")
  }

  const db = await supabase()
  const newAvailable = inventory.available_stock - order.quantity
  const newReserved = inventory.reserved_stock + order.quantity

  const { error: invError } = await db
    .from("inventory")
    .update({ available_stock: newAvailable, reserved_stock: newReserved })
    .eq("id", inventory.id)

  if (invError) throw invError

  await insertLedger(
    order.product_id,
    inventory.available_stock,
    newAvailable,
    inventory.reserved_stock,
    newReserved,
    "RESERVATION",
    `Reserved ${order.quantity} units for order ${order.order_number}`,
    userProfile.user.id,
    order.seller_id,
    null,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, null, order.quantity, "RESERVED")

  revalidatePath("/admin/orders")
  revalidatePath("/dealer/orders")
  return { success: true }
}

export async function deductStock(orderId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const db = await supabase()
  const { data: reservation } = await db
    .from("inventory_reservations")
    .select("*")
    .eq("order_id", orderId)
    .eq("product_id", order.product_id)
    .eq("status", "RESERVED")
    .single()

  if (!reservation) throw new Error("No active reservation found")

  const inventory = await getInventoryRow(order.product_id, order.seller_id, null)
  if (!inventory) throw new Error("Inventory not found")

  const newReserved = Math.max(0, inventory.reserved_stock - order.quantity)
  const { error: invError } = await db
    .from("inventory")
    .update({ reserved_stock: newReserved })
    .eq("id", inventory.id)

  if (invError) throw invError

  await insertLedger(
    order.product_id,
    inventory.available_stock,
    inventory.available_stock,
    inventory.reserved_stock,
    newReserved,
    "SALE",
    `Sold ${order.quantity} units for order ${order.order_number}`,
    userProfile.user.id,
    order.seller_id,
    null,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, null, order.quantity, "DEDUCTED")

  revalidatePath("/admin/orders")
  revalidatePath("/dealer/orders")
  return { success: true }
}

export async function releaseStock(orderId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const db = await supabase()
  const { data: reservation } = await db
    .from("inventory_reservations")
    .select("*")
    .eq("order_id", orderId)
    .eq("product_id", order.product_id)
    .eq("status", "RESERVED")
    .single()

  if (!reservation) throw new Error("No active reservation to release")

  const inventory = await getInventoryRow(order.product_id, order.seller_id, null)
  if (!inventory) throw new Error("Inventory not found")

  const newAvailable = inventory.available_stock + order.quantity
  const newReserved = Math.max(0, inventory.reserved_stock - order.quantity)
  const { error: invError } = await db
    .from("inventory")
    .update({ available_stock: newAvailable, reserved_stock: newReserved })
    .eq("id", inventory.id)

  if (invError) throw invError

  await insertLedger(
    order.product_id,
    inventory.available_stock,
    newAvailable,
    inventory.reserved_stock,
    newReserved,
    "RELEASE",
    `Released reservation for order ${order.order_number}`,
    userProfile.user.id,
    order.seller_id,
    null,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, null, order.quantity, "RELEASED")

  revalidatePath("/admin/orders")
  revalidatePath("/dealer/orders")
  return { success: true }
}

export async function refundStock(orderId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.user) throw new Error("Unauthorized")

  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const db = await supabase()
  const { data: reservation } = await db
    .from("inventory_reservations")
    .select("*")
    .eq("order_id", orderId)
    .eq("product_id", order.product_id)
    .eq("status", "DEDUCTED")
    .single()

  if (!reservation) throw new Error("No deducted stock to refund")

  const inventory = await getInventoryRow(order.product_id, order.seller_id, null)
  if (!inventory) throw new Error("Inventory not found")

  const newAvailable = inventory.available_stock + order.quantity
  const { error: invError } = await db
    .from("inventory")
    .update({ available_stock: newAvailable })
    .eq("id", inventory.id)

  if (invError) throw invError

  await insertLedger(
    order.product_id,
    inventory.available_stock,
    newAvailable,
    inventory.reserved_stock,
    inventory.reserved_stock,
    "RETURN",
    `Refunded ${order.quantity} units for order ${order.order_number}`,
    userProfile.user.id,
    order.seller_id,
    null,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, null, order.quantity, "RETURNED")

  revalidatePath("/admin/orders")
  revalidatePath("/dealer/orders")
  return { success: true }
}

export async function syncOrderInventory(orderId: string, status: string, paymentStatus?: string) {
  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const statusMap: Record<string, () => Promise<{ success: boolean }>> = {
    RESERVED: () => reserveStock(orderId),
    DEDUCTED: () => deductStock(orderId),
    RELEASED: () => releaseStock(orderId),
    RETURNED: () => refundStock(orderId),
  }

  // Order lifecycle mapping
  if (status === "CONFIRMED" && order.status === "PENDING") return await reserveStock(orderId)
  if (paymentStatus === "PAID" && order.payment_status !== "PAID") return await deductStock(orderId)
  if (status === "CANCELLED" && order.status !== "CANCELLED") return await releaseStock(orderId)
  if (paymentStatus === "FAILED" && order.payment_status !== "FAILED") return await releaseStock(orderId)
  if (paymentStatus === "REFUNDED" && order.payment_status !== "REFUNDED") return await refundStock(orderId)

  return { success: false }
}
