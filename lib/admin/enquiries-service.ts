"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import { logActivity } from "@/lib/activity/service"
import type { EnquiryStatus, EnquiryPriority } from "@/types"

export interface AdminProfile {
  id: string
  name: string
  business_name: string | null
  email: string
  phone: string | null
  city: string | null
  state: string | null
  address: string | null
}

export interface AdminProduct {
  id: string
  title: string
  sku: string | null
  price: number
  category: string | null
  brand: string | null
  model: string | null
}

export interface AdminOrderRef {
  id: string
  order_number: string
  status: string
}

export interface AdminQuotationResponse {
  id: string
  dealer: AdminProfile
  status: string
  price: number | null
  delivery_days: number | null
  warranty: string | null
  remarks: string | null
  created_at: string
}

export interface AdminTimelineEvent {
  id: string
  status: EnquiryStatus
  actor: string
  note: string | null
  timestamp: string
}

export interface AdminEnquiry {
  id: string
  buyer: AdminProfile
  seller: AdminProfile
  product: AdminProduct
  assigned_by: { id: string; name: string } | null
  order: AdminOrderRef | null
  quantity: number
  remarks: string | null
  priority: EnquiryPriority
  status: EnquiryStatus
  created_at: string
  updated_at: string
  responses: AdminQuotationResponse[]
  timeline: AdminTimelineEvent[]
}

const ENQUIRY_SELECT = `
  id,
  quantity,
  remarks,
  status,
  priority,
  order_id,
  created_at,
  updated_at,
  buyer:profiles!enquiries_buyer_id_fkey(id, name, business_name, email, phone, city, state, address),
  seller:profiles!enquiries_seller_id_fkey(id, name, business_name, email, phone, city, state),
  assigned_by_profile:profiles!enquiries_assigned_by_fkey(id, name),
  product:products!enquiries_product_id_fkey(id, title, sku, price, category:categories(name), brand:brands(name), model:models(name)),
  order:orders!enquiries_order_id_fkey(id, order_number, status)
`

function mapProfile(row: any): AdminProfile {
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

function mapProduct(row: any): AdminProduct {
  const product = row || {}
  return {
    id: product.id || "",
    title: product.title || "Unknown product",
    sku: product.sku || null,
    price: Number(product.price || 0),
    category: product.category?.name || null,
    brand: product.brand?.name || null,
    model: product.model?.name || null,
  }
}

function mapListItem(row: any): AdminEnquiry {
  return {
    id: row.id,
    buyer: mapProfile(row.buyer),
    seller: mapProfile(row.seller),
    product: mapProduct(row.product),
    assigned_by: row.assigned_by_profile
      ? { id: row.assigned_by_profile.id, name: row.assigned_by_profile.name }
      : null,
    order: row.order ? { id: row.order.id, order_number: row.order.order_number, status: row.order.status } : null,
    quantity: row.quantity,
    remarks: row.remarks,
    priority: row.priority,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
    responses: [],
    timeline: [],
  }
}

function mapTimeline(rows: any[]): AdminTimelineEvent[] {
  return (rows || []).map((t) => ({
    id: t.id,
    status: t.status,
    actor: t.actor?.name || (t.actor_id ? "Admin" : "System"),
    note: t.note,
    timestamp: t.created_at,
  }))
}

function mapQuotationMessages(messages: any[]): AdminQuotationResponse[] {
  return (messages || []).map((m) => ({
    id: m.id,
    dealer: mapProfile(m.sender),
    status: "QUOTED",
    price: m.metadata?.price ?? null,
    delivery_days: m.metadata?.delivery_days ?? null,
    warranty: m.metadata?.warranty ?? null,
    remarks: m.content || m.metadata?.remarks || null,
    created_at: m.created_at,
  }))
}

export async function getAdminEnquiries(): Promise<AdminEnquiry[]> {
  const { data, error } = await supabaseAdmin
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Admin Enquiries - getAdminEnquiries error:", error)
    throw new Error("Failed to fetch enquiries")
  }

  return (data || []).map(mapListItem)
}

export async function getAdminEnquiryDetail(id: string): Promise<AdminEnquiry | null> {
  const { data, error } = await supabaseAdmin
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    console.error("Admin Enquiries - getAdminEnquiryDetail error:", error)
    throw new Error("Failed to fetch enquiry detail")
  }

  if (!data) return null

  const [historyResult, conversationResult] = await Promise.all([
    supabaseAdmin
      .from("enquiry_status_history")
      .select("id, status, note, created_at, actor:profiles!enquiry_status_history_actor_id_fkey(name)")
      .eq("enquiry_id", id)
      .order("created_at", { ascending: true }),
    supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("context_type", "enquiry")
      .eq("context_id", id)
      .maybeSingle(),
  ])

  if (historyResult.error) {
    console.error("Admin Enquiries - history error:", historyResult.error)
  }

  let responses: AdminQuotationResponse[] = []
  if (conversationResult.data?.id) {
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select(
        "id, content, metadata, created_at, sender:profiles!messages_sender_id_fkey(id, name, business_name)"
      )
      .eq("conversation_id", conversationResult.data.id)
      .eq("message_type", "quotation")
      .order("created_at", { ascending: false })

    if (messagesError) {
      console.error("Admin Enquiries - messages error:", messagesError)
    } else {
      responses = mapQuotationMessages(messages || [])
    }
  }

  const enquiry = mapListItem(data)
  enquiry.timeline = mapTimeline(historyResult.data || [])
  enquiry.responses = responses
  return enquiry
}

export async function getAdminDealers(): Promise<AdminProfile[]> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, business_name, email, phone, city, state")
    .eq("role", "DEALER")
    .order("business_name", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("Admin Enquiries - getAdminDealers error:", error)
    throw new Error("Failed to fetch dealers")
  }

  return (data || []).map(mapProfile)
}

export async function getQuotedEnquiryIds(enquiryIds: string[]): Promise<Set<string>> {
  if (enquiryIds.length === 0) return new Set()

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("id, context_id")
    .in("context_id", enquiryIds)
    .eq("context_type", "enquiry")

  if (error || !data || data.length === 0) return new Set()

  const conversationIds = (data || []).map((c: any) => c.id)
  const conversationToEnquiry: Record<string, string> = {}
  for (const c of data) {
    conversationToEnquiry[c.id] = c.context_id
  }

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("conversation_id")
    .in("conversation_id", conversationIds)
    .eq("message_type", "quotation")

  if (messagesError || !messages) return new Set()

  const quoted = new Set<string>()
  for (const m of messages) {
    const enquiryId = conversationToEnquiry[m.conversation_id]
    if (enquiryId) quoted.add(enquiryId)
  }

  return quoted
}

export interface MonthlyEnquiryPoint {
  month: string
  enquiries: number
}

export async function getMonthlyEnquiries(enquiries: AdminEnquiry[]): Promise<MonthlyEnquiryPoint[]> {
  const now = new Date()
  const points: MonthlyEnquiryPoint[] = []
  const counts: Record<string, number> = {}

  for (const e of enquiries) {
    const d = new Date(e.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("en-US", { month: "short" })
    if (!counts[key]) counts[key] = 0
    counts[key]++
  }

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("en-US", { month: "short" })
    points.push({ month: label, enquiries: counts[key] || 0 })
  }

  return points
}

export interface DealerResponseTimePoint {
  dealer: string
  hours: number
}

export async function getDealerResponseTimes(
  enquiries: AdminEnquiry[]
): Promise<DealerResponseTimePoint[]> {
  if (enquiries.length === 0) return []

  const enquiryIds = enquiries.map((e) => e.id)
  const sellerByEnquiry: Record<string, string> = {}
  const createdByEnquiry: Record<string, string> = {}
  for (const e of enquiries) {
    sellerByEnquiry[e.id] = e.seller.id
    createdByEnquiry[e.id] = e.created_at
  }

  const { data: conversations, error: convError } = await supabaseAdmin
    .from("conversations")
    .select("id, context_id")
    .in("context_id", enquiryIds)
    .eq("context_type", "enquiry")

  if (convError || !conversations || conversations.length === 0) return []

  const conversationIds = conversations.map((c: any) => c.id)
  const conversationToEnquiry: Record<string, string> = {}
  for (const c of conversations) {
    conversationToEnquiry[c.id] = c.context_id
  }

  const { data: messages, error: messagesError } = await supabaseAdmin
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: true })

  if (messagesError || !messages) return []

  // For each enquiry, find the first message from the seller (dealer)
  const firstSellerMessage: Record<string, { created_at: string; sellerId: string }> = {}
  for (const m of messages) {
    const enquiryId = conversationToEnquiry[m.conversation_id]
    if (!enquiryId) continue
    if (m.sender_id !== sellerByEnquiry[enquiryId]) continue
    if (!firstSellerMessage[enquiryId]) {
      firstSellerMessage[enquiryId] = { created_at: m.created_at, sellerId: m.sender_id }
    }
  }

  // Group by seller and calculate average response time in hours
  const sums: Record<string, number> = {}
  const counts: Record<string, number> = {}
  const dealerNames: Record<string, string> = {}

  for (const [enquiryId, msg] of Object.entries(firstSellerMessage)) {
    const createdAt = new Date(createdByEnquiry[enquiryId]).getTime()
    const respondedAt = new Date(msg.created_at).getTime()
    if (respondedAt <= createdAt) continue
    const hours = (respondedAt - createdAt) / (1000 * 60 * 60)
    const seller = enquiries.find((e) => e.id === enquiryId)?.seller
    if (!seller) continue
    const key = seller.id
    dealerNames[key] = seller.business_name || seller.name
    sums[key] = (sums[key] || 0) + hours
    counts[key] = (counts[key] || 0) + 1
  }

  const result: DealerResponseTimePoint[] = []
  for (const [sellerId, totalHours] of Object.entries(sums)) {
    const count = counts[sellerId] || 1
    result.push({ dealer: dealerNames[sellerId] || "Unknown", hours: Number((totalHours / count).toFixed(1)) })
  }

  return result.sort((a, b) => a.dealer.localeCompare(b.dealer))
}

export async function assignEnquirySeller(enquiryId: string, sellerId: string | null) {
  const userProfile = await getCurrentUserProfile()
  const adminId = userProfile?.profile?.id || null
  const { user, profile } = await requireAdmin()

  const { data: enquiry } = await supabaseAdmin.from("enquiries").select("id, product:products(title)").eq("id", enquiryId).single()
  const { data: seller } = sellerId ? await supabaseAdmin.from("profiles").select("business_name, name").eq("id", sellerId).single() : null

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (sellerId) {
    update.seller_id = sellerId
    update.status = "ASSIGNED"
    update.assigned_by = adminId
  } else {
    update.status = "PENDING"
  }

  const { error } = await supabaseAdmin.from("enquiries").update(update).eq("id", enquiryId)
  if (error) throw new Error(error.message || "Failed to assign enquiry")

  await logActivity({
    type: "ENQUIRY_ACTION",
    action: sellerId ? "Assigned dealer to enquiry" : "Unassigned dealer from enquiry",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "enquiry",
    target_id: enquiryId,
    target_name: enquiry?.product?.title || "Unknown",
    metadata: { seller_name: seller?.business_name || seller?.name || null },
  })

  revalidatePath("/admin/enquiries")
  revalidatePath(`/admin/enquiries/${enquiryId}`)
}

export async function cancelEnquiry(enquiryId: string) {
  const { user, profile } = await requireAdmin()
  const { data: enquiry } = await supabaseAdmin.from("enquiries").select("id, product:products(title)").eq("id", enquiryId).single()

  const { error } = await supabaseAdmin
    .from("enquiries")
    .update({ status: "REJECTED", updated_at: new Date().toISOString() })
    .eq("id", enquiryId)

  if (error) throw new Error(error.message || "Failed to cancel enquiry")

  await logActivity({
    type: "ENQUIRY_ACTION",
    action: "Cancelled enquiry",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "enquiry",
    target_id: enquiryId,
    target_name: enquiry?.product?.title || "Unknown",
  })

  revalidatePath("/admin/enquiries")
  revalidatePath(`/admin/enquiries/${enquiryId}`)
}

export async function updateEnquiryStatus(enquiryId: string, status: EnquiryStatus) {
  const { user, profile } = await requireAdmin()
  const { data: enquiry } = await supabaseAdmin.from("enquiries").select("id, product:products(title)").eq("id", enquiryId).single()

  const { error } = await supabaseAdmin
    .from("enquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", enquiryId)

  if (error) throw new Error(error.message || "Failed to update enquiry status")

  await logActivity({
    type: "ENQUIRY_ACTION",
    action: `Updated enquiry status to ${status}`,
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "enquiry",
    target_id: enquiryId,
    target_name: enquiry?.product?.title || "Unknown",
  })

  revalidatePath("/admin/enquiries")
  revalidatePath(`/admin/enquiries/${enquiryId}`)
}

export async function addEnquiryNote(enquiryId: string, note: string) {
  const userProfile = await getCurrentUserProfile()
  const adminId = userProfile?.profile?.id || null
  const { user, profile } = await requireAdmin()
  const { data: enquiry } = await supabaseAdmin.from("enquiries").select("id, product:products(title)").eq("id", enquiryId).single()

  const { error } = await supabaseAdmin.from("enquiry_status_history").insert({
    enquiry_id: enquiryId,
    status: "PENDING",
    actor_id: adminId,
    note,
  })

  if (error) throw new Error(error.message || "Failed to add note")

  await logActivity({
    type: "ENQUIRY_ACTION",
    action: "Added note to enquiry",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "enquiry",
    target_id: enquiryId,
    target_name: enquiry?.product?.title || "Unknown",
    metadata: { note },
  })

  revalidatePath("/admin/enquiries")
  revalidatePath(`/admin/enquiries/${enquiryId}`)
}
