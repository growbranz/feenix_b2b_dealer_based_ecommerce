"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import { logActivity } from "@/lib/activity/service"
import { toDisplayPaymentStatus } from "@/lib/orders/dealer-utils"
import type { PaymentStatus } from "@/types/orders"

export interface AdminCustomer {
  id: string
  name: string
  business_name: string | null
  email: string
  phone: string | null
  city: string | null
  state: string | null
  address: string | null
}

export interface AdminDealer {
  id: string
  name: string
  business_name: string | null
}

export interface AdminOrderItem {
  id: string
  product_id: string
  product_name: string
  sku: string | null
  quantity: number
  unit_price: number
  tax: number
  discount: number
  subtotal: number
  total: number
}

export interface AdminOrderDocument {
  id: string
  type: "INVOICE" | "DISPATCH" | "OTHER"
  name: string
  url: string | null
  created_at: string
}

export interface AdminOrderTimelineEvent {
  id: string
  status: string
  actor: string
  note: string | null
  timestamp: string
}

export interface AdminOrder {
  id: string
  order_number: string
  customer: AdminCustomer
  dealer: AdminDealer
  status: string
  payment_status: PaymentStatus
  payment_method: string | null
  item_count: number
  items: AdminOrderItem[]
  subtotal: number
  tax_total: number
  discount_total: number
  shipping_charges: number
  total: number
  grand_total: number
  courier: string | null
  tracking_number: string | null
  expected_delivery: string | null
  documents: AdminOrderDocument[]
  timeline: AdminOrderTimelineEvent[]
  created_at: string
  updated_at: string
}

const ORDER_SELECT = `
  id,
  order_number,
  status,
  payment_status,
  quantity,
  price,
  subtotal,
  tax,
  discount,
  shipping_charges,
  total,
  courier,
  tracking_number,
  expected_delivery,
  created_at,
  updated_at,
  buyer:profiles!orders_buyer_id_fkey(id, name, business_name, email, phone, city, state, address),
  seller:profiles!orders_seller_id_fkey(id, name, business_name),
  product:products(id, title, sku),
  items:order_items(id, product_id, quantity, price, subtotal, tax, discount, total, product:products(title, sku)),
  payments(id, payment_method, status, created_at),
  invoices(id, invoice_number, total, status, created_at),
  documents:order_documents(id, type, name, file_url, created_at)
`

function mapCustomer(row: any): AdminCustomer {
  return {
    id: row?.id || "",
    name: row?.name || "Unknown",
    business_name: row?.business_name || null,
    email: row?.email || "",
    phone: row?.phone || null,
    city: row?.city || null,
    state: row?.state || null,
    address: row?.address || null,
  }
}

function mapDealer(row: any): AdminDealer {
  return {
    id: row?.id || "",
    name: row?.name || "Unknown",
    business_name: row?.business_name || null,
  }
}

function mapItems(row: any): AdminOrderItem[] {
  const items = Array.isArray(row.items) ? row.items : []
  if (items.length > 0) {
    return items.map((it: any) => ({
      id: it.id,
      product_id: it.product_id,
      product_name: it.product?.title || "Unknown product",
      sku: it.product?.sku || null,
      quantity: it.quantity,
      unit_price: Number(it.price || 0),
      tax: Number(it.tax || 0),
      discount: Number(it.discount || 0),
      subtotal: Number(it.subtotal || 0),
      total: Number(it.total || 0),
    }))
  }

  return [
    {
      id: row.id,
      product_id: row.product?.id || "",
      product_name: row.product?.title || "Unknown product",
      sku: row.product?.sku || null,
      quantity: row.quantity,
      unit_price: Number(row.price || 0),
      tax: Number(row.tax || 0),
      discount: Number(row.discount || 0),
      subtotal: Number(row.subtotal || 0),
      total: Number(row.total || 0),
    },
  ]
}

function mapDocuments(row: any): AdminOrderDocument[] {
  const invoiceDocs: AdminOrderDocument[] = (row.invoices || []).map((inv: any) => ({
    id: inv.id,
    type: "INVOICE" as const,
    name: inv.invoice_number,
    url: null,
    created_at: inv.created_at,
  }))
  const uploaded: AdminOrderDocument[] = (row.documents || []).map((doc: any) => ({
    id: doc.id,
    type: doc.type,
    name: doc.name,
    url: doc.file_url,
    created_at: doc.created_at,
  }))
  return [...invoiceDocs, ...uploaded].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

function latestPaymentMethod(row: any): string | null {
  const payments = Array.isArray(row.payments) ? row.payments : []
  if (payments.length === 0) return null
  const latest = [...payments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]
  return latest?.payment_method || null
}

function mapListItem(row: any): AdminOrder {
  const items = mapItems(row)
  return {
    id: row.id,
    order_number: row.order_number,
    customer: mapCustomer(row.buyer),
    dealer: mapDealer(row.seller),
    status: row.status,
    payment_status: toDisplayPaymentStatus(row.payment_status),
    payment_method: latestPaymentMethod(row),
    item_count: items.length,
    items,
    subtotal: Number(row.subtotal || 0),
    tax_total: Number(row.tax || 0),
    discount_total: Number(row.discount || 0),
    shipping_charges: Number(row.shipping_charges || 0),
    total: Number(row.total || 0),
    grand_total: Number(row.total || 0) + Number(row.shipping_charges || 0) - Number(row.discount || 0),
    courier: row.courier || null,
    tracking_number: row.tracking_number || null,
    expected_delivery: row.expected_delivery || null,
    documents: mapDocuments(row),
    timeline: [],
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }
}

function mapTimeline(rows: any[]): AdminOrderTimelineEvent[] {
  return (rows || []).map((t) => ({
    id: t.id,
    status: t.status,
    actor: t.actor?.name || (t.actor_id ? "Dealer" : "System"),
    note: t.note,
    timestamp: t.created_at,
  }))
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Admin Orders - getAdminOrders error:", error)
    throw new Error("Failed to fetch orders")
  }

  return (data || []).map(mapListItem)
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrder | null> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Admin Orders - getAdminOrderDetail error:", error)
    throw new Error("Failed to fetch order detail")
  }

  if (!data) return null

  const { data: historyRows, error: historyError } = await supabaseAdmin
    .from("order_status_history")
    .select("id, status, note, created_at, actor_id, actor:profiles(name)")
    .eq("order_id", id)
    .order("created_at", { ascending: true })

  if (historyError) console.error("Admin Orders - history error:", historyError)

  const order = mapListItem(data)
  order.timeline = mapTimeline(historyRows || [])
  return order
}

export async function updateAdminOrderStatus(orderId: string, status: string) {
  const { user, profile } = await requireAdmin()
  const { data: order } = await supabaseAdmin.from("orders").select("order_number").eq("id", orderId).single()
  
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) throw new Error(error.message || "Failed to update order status")

  await logActivity({
    type: "ORDER_ACTION",
    action: `Updated order status to ${status}`,
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "order",
    target_id: orderId,
    target_name: order?.order_number || "Unknown",
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function assignAdminOrderSeller(orderId: string, sellerId: string) {
  const { user, profile } = await requireAdmin()
  const { data: order } = await supabaseAdmin.from("orders").select("order_number").eq("id", orderId).single()
  const { data: seller } = await supabaseAdmin.from("profiles").select("business_name, name").eq("id", sellerId).single()
  
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ seller_id: sellerId, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) throw new Error(error.message || "Failed to assign dealer")

  await logActivity({
    type: "ORDER_ACTION",
    action: "Assigned dealer to order",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "order",
    target_id: orderId,
    target_name: order?.order_number || "Unknown",
    metadata: { seller_name: seller?.business_name || seller?.name || null },
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function cancelAdminOrder(orderId: string) {
  const { user, profile } = await requireAdmin()
  const { data: order } = await supabaseAdmin.from("orders").select("order_number").eq("id", orderId).single()
  
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) throw new Error(error.message || "Failed to cancel order")

  await logActivity({
    type: "ORDER_ACTION",
    action: "Cancelled order",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "order",
    target_id: orderId,
    target_name: order?.order_number || "Unknown",
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function refundAdminOrder(orderId: string) {
  const { user, profile } = await requireAdmin()
  const { data: order } = await supabaseAdmin.from("orders").select("order_number").eq("id", orderId).single()
  
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "REFUNDED",
      payment_status: "REFUNDED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)

  if (error) throw new Error(error.message || "Failed to refund order")

  await logActivity({
    type: "ORDER_ACTION",
    action: "Refunded order",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "order",
    target_id: orderId,
    target_name: order?.order_number || "Unknown",
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

export async function uploadAdminOrderDocument(
  orderId: string,
  input: { type: "INVOICE" | "DISPATCH" | "OTHER"; name: string }
) {
  const userProfile = await getCurrentUserProfile()
  const adminId = userProfile?.profile?.id || null
  const { user, profile } = await requireAdmin()
  const { data: order } = await supabaseAdmin.from("orders").select("order_number").eq("id", orderId).single()

  const { error } = await supabaseAdmin.from("order_documents").insert({
    order_id: orderId,
    type: input.type,
    name: input.name.trim(),
    uploaded_by: adminId,
  })

  if (error) throw new Error(error.message || "Failed to upload document")

  await logActivity({
    type: "ORDER_ACTION",
    action: `Uploaded ${input.type} document to order`,
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "order",
    target_id: orderId,
    target_name: order?.order_number || "Unknown",
    metadata: { document_type: input.type, document_name: input.name },
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}
