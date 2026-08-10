"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { toDisplayPaymentStatus } from "@/lib/orders/dealer-utils"
import type { OrderStatus } from "@/types"
import type {
  DealerOrderDetail,
  DealerOrderDocument,
  DealerOrderFilters,
  DealerOrderItem,
  DealerOrderListItem,
  DealerOrderTimelineEvent,
  PaginatedOrders,
} from "@/types/orders"

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
  product:products(id, title, sku),
  items:order_items(id, product_id, quantity, price, subtotal, tax, discount, total, product:products(title, sku)),
  payments(id, payment_method, status, created_at),
  invoices(id, invoice_number, total, status, created_at),
  documents:order_documents(id, type, name, file_url, created_at)
`

function mapItems(row: any): DealerOrderItem[] {
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

  // Orders today are single-product (product_id/quantity live directly on
  // the order row); synthesize a single line item from that.
  return [
    {
      id: row.id,
      product_id: row.product?.id || "",
      product_name: row.product?.title || "Unknown product",
      sku: row.product?.sku || null,
      quantity: row.quantity,
      unit_price: Number(row.price || 0),
      tax: Number(row.tax || 0),
      discount: 0,
      subtotal: Number(row.subtotal || 0),
      total: Number(row.total || 0),
    },
  ]
}

function mapDocuments(row: any): DealerOrderDocument[] {
  const invoiceDocs: DealerOrderDocument[] = (row.invoices || []).map((inv: any) => ({
    id: inv.id,
    type: "INVOICE" as const,
    name: inv.invoice_number,
    url: null,
    created_at: inv.created_at,
  }))
  const uploaded: DealerOrderDocument[] = (row.documents || []).map((doc: any) => ({
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

function mapListItem(row: any): DealerOrderListItem {
  const items = mapItems(row)
  return {
    id: row.id,
    order_number: row.order_number,
    customer: {
      id: row.buyer?.id || "",
      name: row.buyer?.name || "Unknown",
      business_name: row.buyer?.business_name || null,
      email: row.buyer?.email || "",
      phone: row.buyer?.phone || null,
      city: row.buyer?.city || null,
      state: row.buyer?.state || null,
      address: row.buyer?.address || null,
    },
    status: row.status,
    payment_status: toDisplayPaymentStatus(row.payment_status),
    payment_method: latestPaymentMethod(row),
    item_count: items.length,
    grand_total: Number(row.total || 0) + Number(row.shipping_charges || 0) - Number(row.discount || 0),
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }
}

function mapTimeline(rows: any[]): DealerOrderTimelineEvent[] {
  return (rows || []).map((t: any) => ({
    id: t.id,
    status: t.status,
    actor: t.actor?.name || (t.actor_id ? "Dealer" : "System"),
    note: t.note,
    timestamp: t.created_at,
  }))
}

/**
 * Orders belonging to the currently authenticated dealer (as seller).
 * Relies entirely on the `orders_select_parties` RLS policy
 * (seller_id = auth.uid() OR is_admin()) rather than filtering client-side,
 * so a dealer can never receive another dealer's orders even if the
 * `dealerId` argument were wrong.
 */
export async function getDealerOrders(
  dealerId: string,
  filters: DealerOrderFilters = {}
): Promise<PaginatedOrders<DealerOrderListItem>> {
  const { search, status, page = 1, limit = 10 } = filters
  const supabase: any = await createServerClient()

  let query = supabase
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .eq("seller_id", dealerId)
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status as OrderStatus)
  }

  const { data, error } = await query
  if (error) {
    console.error("getDealerOrders error:", error)
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  let mapped: DealerOrderListItem[] = (data || []).map(mapListItem)

  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    mapped = mapped.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        (o.customer.business_name || "").toLowerCase().includes(q)
    )
  }

  const count = mapped.length
  const totalPages = Math.max(1, Math.ceil(count / limit))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paged = mapped.slice((currentPage - 1) * limit, currentPage * limit)

  return { data: paged, count, page: currentPage, limit, totalPages }
}

export async function getDealerOrderDetail(
  dealerId: string,
  orderId: string
): Promise<DealerOrderDetail | null> {
  const supabase: any = await createServerClient()

  const { data: row, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("seller_id", dealerId)
    .single()

  if (error || !row) {
    if (error && error.code !== "PGRST116") console.error("getDealerOrderDetail error:", error)
    return null
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("order_status_history")
    .select("id, status, note, created_at, actor_id, actor:profiles(name)")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })

  if (historyError) console.error("getDealerOrderDetail history error:", historyError)

  const listItem = mapListItem(row)
  return {
    ...listItem,
    items: mapItems(row),
    subtotal: Number((row as any).subtotal || 0),
    tax_total: Number((row as any).tax || 0),
    discount_total: Number((row as any).discount || 0),
    shipping_charges: Number((row as any).shipping_charges || 0),
    courier: (row as any).courier || null,
    tracking_number: (row as any).tracking_number || null,
    expected_delivery: (row as any).expected_delivery || null,
    documents: mapDocuments(row),
    timeline: mapTimeline(historyRows || []),
  }
}

async function assertDealerOwnsOrder(orderId: string, dealerId: string) {
  const supabase: any = await createServerClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, seller_id, status")
    .eq("id", orderId)
    .single()
  if (error || !data) throw new Error("Order not found")
  if (data.seller_id !== dealerId) throw new Error("Unauthorized")
  return data
}

export async function updateDealerOrderStatus(orderId: string, newStatus: OrderStatus) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  await assertDealerOwnsOrder(orderId, userProfile.profile.id)

  const supabase: any = await createServerClient()
  const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
  if (error) throw error

  revalidatePath(`/dealer/orders/${orderId}`)
  revalidatePath("/dealer/orders")
  return { success: true }
}

export async function dispatchDealerOrder(
  orderId: string,
  input: { courier: string; trackingNumber: string; expectedDelivery?: string; documentName?: string }
) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  await assertDealerOwnsOrder(orderId, userProfile.profile.id)

  const supabase: any = await createServerClient()
  const { error } = await supabase
    .from("orders")
    .update({
      status: "SHIPPED" as OrderStatus,
      courier: input.courier,
      tracking_number: input.trackingNumber,
      expected_delivery: input.expectedDelivery || null,
    })
    .eq("id", orderId)
  if (error) throw error

  if (input.documentName?.trim()) {
    await supabase.from("order_documents").insert({
      order_id: orderId,
      type: "DISPATCH",
      name: input.documentName.trim(),
      uploaded_by: userProfile.profile.id,
    })
  }

  revalidatePath(`/dealer/orders/${orderId}`)
  revalidatePath("/dealer/orders")
  return { success: true }
}

export async function uploadDealerOrderDocument(
  orderId: string,
  input: { type: "INVOICE" | "DISPATCH" | "OTHER"; name: string }
) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  await assertDealerOwnsOrder(orderId, userProfile.profile.id)

  const supabase: any = await createServerClient()
  const { error } = await supabase.from("order_documents").insert({
    order_id: orderId,
    type: input.type,
    name: input.name.trim(),
    uploaded_by: userProfile.profile.id,
  })
  if (error) throw error

  revalidatePath(`/dealer/orders/${orderId}`)
  return { success: true }
}
