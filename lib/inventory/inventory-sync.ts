import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Inventory, Order } from "@/types"

const db = supabaseAdmin as any

async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await db.from("orders").select("*").eq("id", orderId).single()
  if (error?.code === "PGRST116") return null
  if (error) throw error
  return data as Order
}

async function getInventoryRow(productId: string, dealerId: string): Promise<Inventory | null> {
  const { data, error } = await db
    .from("inventory")
    .select("*")
    .eq("product_id", productId)
    .eq("dealer_id", dealerId)
    .is("warehouse_id", null)
    .single()

  if (error?.code === "PGRST116") return null
  if (error) throw error
  return data as Inventory
}

async function upsertReservation(
  orderId: string,
  productId: string,
  dealerId: string,
  quantity: number,
  status: "RESERVED" | "DEDUCTED" | "RELEASED" | "RETURNED"
) {
  const { data: existing } = await db
    .from("inventory_reservations")
    .select("id")
    .eq("order_id", orderId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing) {
    const { error } = await db
      .from("inventory_reservations")
      .update({ status, quantity })
      .eq("id", existing.id)
    if (error) throw error
    return
  }

  const { error } = await db.from("inventory_reservations").insert({
    order_id: orderId,
    product_id: productId,
    dealer_id: dealerId,
    quantity,
    status,
  })
  if (error) throw error
}

async function insertLedger(
  productId: string,
  previousAvailable: number,
  updatedAvailable: number,
  previousReserved: number,
  updatedReserved: number,
  movementType: any,
  reason: string,
  actorId: string | null,
  dealerId: string,
  orderId: string
) {
  const { error } = await db.from("inventory_ledger").insert({
    product_id: productId,
    dealer_id: dealerId,
    warehouse_id: null,
    order_id: orderId,
    user_id: actorId,
    previous_quantity: previousAvailable,
    updated_quantity: updatedAvailable,
    previous_reserved: previousReserved,
    updated_reserved: updatedReserved,
    movement_type: movementType,
    reason,
  })
  if (error) throw error
}

export async function reserveOrderStock(orderId: string, actorId: string | null) {
  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const inventory = await getInventoryRow(order.product_id, order.seller_id)
  if (!inventory || inventory.available_stock < order.quantity) {
    throw new Error("Insufficient stock to reserve")
  }

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
    actorId,
    order.seller_id,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, order.quantity, "RESERVED")
  return { success: true }
}

export async function deductOrderStock(orderId: string, actorId: string | null) {
  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const { data: reservation } = await db
    .from("inventory_reservations")
    .select("*")
    .eq("order_id", orderId)
    .eq("product_id", order.product_id)
    .eq("status", "RESERVED")
    .single()

  if (!reservation) throw new Error("No active reservation to deduct")

  const inventory = await getInventoryRow(order.product_id, order.seller_id)
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
    actorId,
    order.seller_id,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, order.quantity, "DEDUCTED")
  return { success: true }
}

export async function releaseOrderStock(orderId: string, actorId: string | null) {
  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const { data: reservation } = await db
    .from("inventory_reservations")
    .select("*")
    .eq("order_id", orderId)
    .eq("product_id", order.product_id)
    .eq("status", "RESERVED")
    .single()

  if (!reservation) throw new Error("No active reservation to release")

  const inventory = await getInventoryRow(order.product_id, order.seller_id)
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
    actorId,
    order.seller_id,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, order.quantity, "RELEASED")
  return { success: true }
}

export async function refundOrderStock(orderId: string, actorId: string | null) {
  const order = await getOrder(orderId)
  if (!order) throw new Error("Order not found")

  const { data: reservation } = await db
    .from("inventory_reservations")
    .select("*")
    .eq("order_id", orderId)
    .eq("product_id", order.product_id)
    .eq("status", "DEDUCTED")
    .single()

  if (!reservation) throw new Error("No deducted stock to refund")

  const inventory = await getInventoryRow(order.product_id, order.seller_id)
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
    actorId,
    order.seller_id,
    order.id
  )

  await upsertReservation(order.id, order.product_id, order.seller_id, order.quantity, "RETURNED")
  return { success: true }
}
