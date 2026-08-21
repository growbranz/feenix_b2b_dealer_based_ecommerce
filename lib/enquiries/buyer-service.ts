"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import type {
  DealerEnquiryDetail,
  DealerEnquiryFilters,
  DealerEnquiryListItem,
  DealerEnquiryTimelineEvent,
  PaginatedEnquiries,
} from "@/types/enquiries"

export interface CreateEnquiryInput {
  product_id: string
  quantity: number
  remarks?: string
}

export interface CreateEnquiryResult {
  success: boolean
  error?: string
  enquiryId?: string
}

const BUYER_ENQUIRY_SELECT = `
  id,
  quantity,
  remarks,
  status,
  priority,
  order_id,
  created_at,
  updated_at,
  seller:profiles!enquiries_seller_id_fkey(id, name, business_name, email, phone, city, state, address),
  product:products(id, title, sku, price, category:categories(name), brand:brands(name), model:models(name)),
  order:orders(id, order_number, status, payment_status)
`

function mapBuyerListItem(row: any): DealerEnquiryListItem {
  const product = row.product || {}
  const images = product.images || []
  const primaryImage = Array.isArray(images) ? images[0] : null
  
  return {
    id: row.id,
    buyer: {
      id: "", // Not needed for buyer view
      name: "",
      business_name: null,
      email: "",
      phone: null,
      city: null,
      state: null,
      address: null,
    },
    product: {
      id: product.id || "",
      title: product.title || "Unknown product",
      sku: product.sku || null,
      price: Number(product.price || 0),
      category: product.category?.name || null,
      brand: product.brand?.name || null,
      model: product.model?.name || null,
    },
    quantity: row.quantity,
    remarks: row.remarks,
    status: row.status,
    priority: row.priority,
    assigned_by: null,
    order: row.order ? { id: row.order.id, order_number: row.order.order_number, status: row.order.status } : null,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }
}

function mapBuyerTimeline(rows: any[]): DealerEnquiryTimelineEvent[] {
  return (rows || []).map((t: any) => ({
    id: t.id,
    status: t.status,
    actor: t.actor?.name || (t.actor_id ? "System" : "System"),
    note: t.note,
    timestamp: t.created_at,
  }))
}

/**
 * Enquiries created by the currently authenticated dealer (as buyer).
 * Relies on the `enquiries_select_parties` RLS policy
 * (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin())
 */
export async function getBuyerEnquiries(
  buyerId: string,
  filters: DealerEnquiryFilters = {}
): Promise<PaginatedEnquiries<DealerEnquiryListItem>> {
  const { search, status, priority, page = 1, limit = 10 } = filters
  const supabase: any = await createServerClient()

  let query = supabase
    .from("enquiries")
    .select(BUYER_ENQUIRY_SELECT)
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status)
  }
  if (priority && priority !== "all") {
    query = query.eq("priority", priority)
  }

  const { data, error } = await query
  if (error) {
    console.error(
      "getBuyerEnquiries error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    )
    console.error("getBuyerEnquiries error fields:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  let mapped: DealerEnquiryListItem[] = (data || []).map(mapBuyerListItem)

  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    mapped = mapped.filter(
      (e) =>
        e.product.title.toLowerCase().includes(q) ||
        (data.find((d: any) => d.id === e.id)?.seller?.business_name || "").toLowerCase().includes(q)
    )
  }

  const count = mapped.length
  const totalPages = Math.max(1, Math.ceil(count / limit))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paged = mapped.slice((currentPage - 1) * limit, currentPage * limit)

  return { data: paged, count, page: currentPage, limit, totalPages }
}

export async function getBuyerEnquiryDetail(
  buyerId: string,
  enquiryId: string
): Promise<DealerEnquiryDetail | null> {
  const supabase: any = await createServerClient()

  const { data: row, error } = await supabase
    .from("enquiries")
    .select(BUYER_ENQUIRY_SELECT)
    .eq("id", enquiryId)
    .eq("buyer_id", buyerId)
    .single()

  if (error || !row) {
    if (error && error.code !== "PGRST116") console.error("getBuyerEnquiryDetail error:", error)
    return null
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("enquiry_status_history")
    .select("id, status, note, created_at, actor_id, actor:profiles(name)")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: true })

  if (historyError) console.error("getBuyerEnquiryDetail history error:", historyError)

  // Find the conversation attached to this enquiry
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("context_type", "enquiry")
    .eq("context_id", enquiryId)
    .maybeSingle()

  // Fetch the latest quotation message from that conversation only
  let latestQuotation: any = null
  if (conversation?.id) {
    const { data: quotationMessages } = await supabase
      .from("messages")
      .select("id, content, metadata, created_at, sender_id")
      .eq("conversation_id", conversation.id)
      .eq("message_type", "quotation")
      .order("created_at", { ascending: false })
      .limit(1)

    latestQuotation = quotationMessages?.[0] || null
  }

  return {
    ...mapBuyerListItem(row),
    conversationId: conversation?.id || null,
    latestQuotation,
    timeline: mapBuyerTimeline(historyRows || []),
  }
}

/**
 * Create a new enquiry from a buyer (dealer) to a seller (product owner).
 * 
 * This function:
 * - Validates the user is authenticated
 * - Prevents self-enquiry (buyer cannot enquire on their own product)
 * - Sets buyer_id to authenticated user
 * - Sets seller_id to product owner's dealer_id
 * - Inserts into public.enquiries with RLS-compliant values
 * - Uses existing RLS policy: enquiries_insert_buyer (buyer_id = auth.uid())
 */
export async function createEnquiry(input: CreateEnquiryInput): Promise<CreateEnquiryResult> {
  try {
    // Get current authenticated user
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return { success: false, error: "You must be logged in to send an enquiry" }
    }

    const buyerId = userProfile.profile.id

    // Validate input
    if (!input.product_id) {
      return { success: false, error: "Product ID is required" }
    }

    if (!input.quantity || input.quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" }
    }

    if (input.quantity && !Number.isInteger(input.quantity)) {
      return { success: false, error: "Quantity must be a whole number" }
    }

    // Get product details to determine seller_id
    const supabase = await createServerClient()
    const supabaseAny1: any = supabase
    const { data: product, error: productError } = await supabaseAny1
      .from("products")
      .select("id, dealer_id, title, status")
      .eq("id", input.product_id)
      .single()

    if (productError || !product) {
      return { success: false, error: "Product not found" }
    }

    // Prevent self-enquiry
    if ((product as any).dealer_id === buyerId) {
      return { success: false, error: "You cannot send an enquiry for your own product" }
    }

    // Check if product is active
    if ((product as any).status !== "ACTIVE") {
      return { success: false, error: "This product is not available for enquiry" }
    }

    // Check for existing enquiry from this buyer for this product
    const supabaseAny2: any = supabase
    const { data: existingEnquiry } = await supabaseAny2
      .from("enquiries")
      .select("id, status")
      .eq("buyer_id", buyerId)
      .eq("product_id", input.product_id)
      .in("status", ["PENDING", "ASSIGNED", "ACCEPTED"])
      .maybeSingle()

    if (existingEnquiry) {
      return { 
        success: false, 
        error: `You already have an ${(existingEnquiry as any).status.toLowerCase()} enquiry for this product` 
      }
    }

    // Insert the enquiry
    // RLS policy: enquiries_insert_buyer allows insertion when buyer_id = auth.uid()
    const supabaseAny3: any = supabase
    const { data: enquiry, error: insertError } = await supabaseAny3
      .from("enquiries")
      .insert({
        buyer_id: buyerId,
        seller_id: (product as any).dealer_id,
        product_id: input.product_id,
        quantity: input.quantity,
        remarks: input.remarks || null,
        status: "PENDING",
        priority: "MEDIUM", // Default priority as per schema
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Error creating enquiry:", insertError)
      return { success: false, error: "Failed to create enquiry. Please try again." }
    }

    // Revalidate product page to show updated state if needed
    revalidatePath(`/products/${(product as any).dealer_id}`)

    return { 
      success: true, 
      enquiryId: (enquiry as any)?.id 
    }

  } catch (error) {
    console.error("Unexpected error in createEnquiry:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}

async function assertBuyerOwnsEnquiry(enquiryId: string, buyerId: string) {
  const supabase: any = await createServerClient()
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, buyer_id, seller_id, order_id, status")
    .eq("id", enquiryId)
    .eq("buyer_id", buyerId)
    .single()

  if (error || !data) throw new Error("Enquiry not found")
  return data
}

async function getEnquiryConversation(enquiryId: string, supabase: any) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("context_type", "enquiry")
    .eq("context_id", enquiryId)
    .maybeSingle()
  return conversation
}

async function getLatestQuotation(conversationId: string, supabase: any) {
  const { data: quotationMessages } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("message_type", "quotation")
    .order("created_at", { ascending: false })
    .limit(1)
  return quotationMessages?.[0] || null
}

export async function acceptBuyerQuotation(enquiryId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  const supabase: any = await createServerClient()
  const enquiry = await assertBuyerOwnsEnquiry(enquiryId, userProfile.profile.id)

  if (enquiry.order_id) throw new Error("An order already exists for this enquiry")
  if (enquiry.status === "REJECTED") throw new Error("Cannot accept a quotation for a rejected enquiry")
  if (enquiry.status === "COMPLETED") throw new Error("This enquiry is already completed")

  const conversation = await getEnquiryConversation(enquiryId, supabase)
  if (!conversation?.id) throw new Error("No conversation found for this enquiry")

  const latestQuotation = await getLatestQuotation(conversation.id, supabase)
  if (!latestQuotation) throw new Error("No quotation found to accept")

  // Keep the enquiry in ACCEPTED state so the seller can explicitly create an order
  const { error } = await supabase
    .from("enquiries")
    .update({ status: "ACCEPTED" })
    .eq("id", enquiryId)
    .eq("buyer_id", userProfile.profile.id)

  if (error) throw error

  revalidatePath(`/dealer/my-enquiries/${enquiryId}`)
  revalidatePath("/dealer/my-enquiries")
  return { success: true }
}

export async function rejectBuyerQuotation(enquiryId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  const supabase: any = await createServerClient()
  const enquiry = await assertBuyerOwnsEnquiry(enquiryId, userProfile.profile.id)

  if (enquiry.order_id) throw new Error("An order already exists for this enquiry")
  if (enquiry.status === "COMPLETED") throw new Error("This enquiry is already completed")

  const conversation = await getEnquiryConversation(enquiryId, supabase)
  if (!conversation?.id) throw new Error("No conversation found for this enquiry")

  const latestQuotation = await getLatestQuotation(conversation.id, supabase)
  if (!latestQuotation) throw new Error("No quotation found to reject")

  const { error } = await supabase
    .from("enquiries")
    .update({ status: "REJECTED" })
    .eq("id", enquiryId)
    .eq("buyer_id", userProfile.profile.id)

  if (error) throw error

  revalidatePath(`/dealer/my-enquiries/${enquiryId}`)
  revalidatePath("/dealer/my-enquiries")
  return { success: true }
}