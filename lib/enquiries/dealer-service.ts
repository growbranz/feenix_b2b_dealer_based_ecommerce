"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { generateOrderNumber } from "@/lib/orders/dealer-utils"
import { getOrCreateDirectConversation, sendMessage } from "@/lib/chat/actions"
import type { EnquiryStatus } from "@/types"
import type {
  DealerEnquiryDetail,
  DealerEnquiryFilters,
  DealerEnquiryListItem,
  DealerEnquiryTimelineEvent,
  PaginatedEnquiries,
} from "@/types/enquiries"

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
  assigned_by_profile:profiles!enquiries_assigned_by_fkey(id, name),
  product:products(id, title, sku, price, category:categories(name), brand:brands(name), model:models(name)),
  order:orders(id, order_number, status)
`

function mapListItem(row: any): DealerEnquiryListItem {
  const product = row.product || {}
  return {
    id: row.id,
    buyer: {
      id: row.buyer?.id || "",
      name: row.buyer?.name || "Unknown",
      business_name: row.buyer?.business_name || null,
      email: row.buyer?.email || "",
      phone: row.buyer?.phone || null,
      city: row.buyer?.city || null,
      state: row.buyer?.state || null,
      address: row.buyer?.address || null,
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
    assigned_by: row.assigned_by_profile
      ? { id: row.assigned_by_profile.id, name: row.assigned_by_profile.name }
      : null,
    order: row.order ? { id: row.order.id, order_number: row.order.order_number, status: row.order.status } : null,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }
}

function mapTimeline(rows: any[]): DealerEnquiryTimelineEvent[] {
  return (rows || []).map((t: any) => ({
    id: t.id,
    status: t.status,
    actor: t.actor?.name || (t.actor_id ? "Dealer" : "System"),
    note: t.note,
    timestamp: t.created_at,
  }))
}

/**
 * Enquiries belonging to the currently authenticated dealer (as seller).
 * Relies on the `enquiries_select_parties` RLS policy
 * (seller_id = auth.uid() OR is_admin()) - a dealer can never receive
 * another dealer's enquiries even if the `dealerId` argument were wrong.
 */
export async function getDealerEnquiries(
  dealerId: string,
  filters: DealerEnquiryFilters = {}
): Promise<PaginatedEnquiries<DealerEnquiryListItem>> {
  const { search, status, priority, page = 1, limit = 10 } = filters
  const supabase: any = await createServerClient()

  let query = supabase
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("seller_id", dealerId)
    .order("created_at", { ascending: false })

  if (status && status !== "all") {
    query = query.eq("status", status as EnquiryStatus)
  }
  if (priority && priority !== "all") {
    query = query.eq("priority", priority)
  }

  const { data, error } = await query
  if (error) {
    console.error("getDealerEnquiries error:", error)
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  let mapped: DealerEnquiryListItem[] = (data || []).map(mapListItem)

  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    mapped = mapped.filter(
      (e) =>
        e.product.title.toLowerCase().includes(q) ||
        e.buyer.name.toLowerCase().includes(q) ||
        (e.buyer.business_name || "").toLowerCase().includes(q)
    )
  }

  const count = mapped.length
  const totalPages = Math.max(1, Math.ceil(count / limit))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const paged = mapped.slice((currentPage - 1) * limit, currentPage * limit)

  return { data: paged, count, page: currentPage, limit, totalPages }
}

export async function getDealerEnquiryDetail(
  dealerId: string,
  enquiryId: string
): Promise<DealerEnquiryDetail | null> {
  const supabase: any = await createServerClient()

  const { data: row, error } = await supabase
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("id", enquiryId)
    .eq("seller_id", dealerId)
    .single()

  if (error || !row) {
    if (error && error.code !== "PGRST116") console.error("getDealerEnquiryDetail error:", error)
    return null
  }

  const { data: historyRows, error: historyError } = await supabase
    .from("enquiry_status_history")
    .select("id, status, note, created_at, actor_id, actor:profiles(name)")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: true })

  if (historyError) console.error("getDealerEnquiryDetail history error:", historyError)

  return {
    ...mapListItem(row),
    timeline: mapTimeline(historyRows || []),
  }
}

async function assertDealerOwnsEnquiry(enquiryId: string, dealerId: string) {
  const supabase: any = await createServerClient()
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, seller_id, buyer_id, product_id, quantity, status, order_id")
    .eq("id", enquiryId)
    .single()
  if (error || !data) throw new Error("Enquiry not found")
  if (data.seller_id !== dealerId) throw new Error("Unauthorized")
  return data
}

export async function updateDealerEnquiryStatus(enquiryId: string, newStatus: "ACCEPTED" | "REJECTED") {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  await assertDealerOwnsEnquiry(enquiryId, userProfile.profile.id)

  const supabase: any = await createServerClient()
  const { error } = await supabase.from("enquiries").update({ status: newStatus }).eq("id", enquiryId)
  if (error) throw error

  revalidatePath(`/dealer/enquiries/${enquiryId}`)
  revalidatePath("/dealer/enquiries")
  return { success: true }
}

/**
 * Explicit "Create Order" action. Only allowed once the dealer has
 * accepted the enquiry, and only once (order_id must be null). Does not
 * fire automatically on accept, per the required workflow. Order creation
 * reuses the existing orders table and the existing `orders_created_stock`
 * DB trigger for inventory reservation - no new stock logic is added here.
 */
export async function createOrderFromEnquiry(enquiryId: string) {
  console.log("CREATE ORDER START", { enquiryId })

  const userProfile = await getCurrentUserProfile()
  console.log("AUTHENTICATED USER", {
    userId: userProfile?.user?.id,
    profileId: userProfile?.profile?.id,
    profileName: userProfile?.profile?.name,
  })
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  const enquiry = await assertDealerOwnsEnquiry(enquiryId, userProfile.profile.id)
  console.log("ENQUIRY DATA", {
    id: enquiry.id,
    buyer_id: enquiry.buyer_id,
    seller_id: enquiry.seller_id,
    product_id: enquiry.product_id,
    quantity: enquiry.quantity,
    status: enquiry.status,
    order_id: enquiry.order_id,
  })

  if (enquiry.status !== "ACCEPTED") throw new Error("Enquiry must be accepted before creating an order")
  if (enquiry.order_id) throw new Error("This enquiry already has an order")

  const supabase: any = await createServerClient()
  console.log("Fetching product for:", enquiry.product_id)

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price")
    .eq("id", enquiry.product_id)
    .single()
  if (productError || !product) {
    console.error("CREATE ORDER SUPABASE ERROR - PRODUCT FETCH", {
      code: productError?.code,
      message: productError?.message,
      details: productError?.details,
      hint: productError?.hint,
      fullError: productError,
    })
    throw new Error(`Product not found: ${productError?.message || productError?.details || productError?.hint || 'Unknown error'}`)
  }

  console.log("PRODUCT DATA", { id: product.id, price: product.price })

  const price = Number(product.price || 0)
  const subtotal = price * enquiry.quantity
  const tax = 0
  const total = subtotal + tax

  const orderNumber = generateOrderNumber()
  const orderPayload = {
    order_number: orderNumber,
    buyer_id: enquiry.buyer_id,
    seller_id: enquiry.seller_id,
    product_id: enquiry.product_id,
    quantity: enquiry.quantity,
    price,
    subtotal,
    tax,
    discount: 0,
    shipping_charges: 0,
    total,
    status: "PENDING",
    payment_status: "PENDING",
  }

  console.log("ORDER INSERT PAYLOAD", orderPayload)

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id, order_number, status")
    .single()

  if (orderError || !order) {
    console.error("CREATE ORDER SUPABASE ERROR - ORDER INSERT", {
      code: orderError?.code,
      message: orderError?.message,
      details: orderError?.details,
      hint: orderError?.hint,
      fullError: orderError,
    })
    throw new Error(`Failed to create order: ${orderError?.message || orderError?.details || orderError?.hint || 'Unknown error'}`)
  }

  console.log("ORDER CREATED SUCCESSFULLY", { id: order.id, order_number: order.order_number, status: order.status })

  console.log("Updating enquiry with order_id and status")
  const { error: linkError } = await supabase
    .from("enquiries")
    .update({ order_id: order.id, status: "COMPLETED" })
    .eq("id", enquiryId)

  if (linkError) {
    console.error("CREATE ORDER SUPABASE ERROR - ENQUIRY UPDATE", {
      code: linkError?.code,
      message: linkError?.message,
      details: linkError?.details,
      hint: linkError?.hint,
      fullError: linkError,
    })
    throw new Error(`Failed to link order to enquiry: ${linkError?.message || linkError?.details || linkError?.hint || 'Unknown error'}`)
  }

  console.log("ENQUIRY UPDATED SUCCESSFULLY")

  revalidatePath(`/dealer/enquiries/${enquiryId}`)
  revalidatePath("/dealer/enquiries")
  revalidatePath("/dealer/orders")
  console.log("CREATE ORDER COMPLETE", { orderId: order.id, orderNumber: order.order_number })
  return { success: true, order }
}

/**
 * Opens (or creates) the buyer<->dealer conversation for this enquiry,
 * reusing the existing messaging system rather than a bespoke thread.
 */
export async function getOrCreateEnquiryConversation(enquiryId: string) {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  const enquiry = await assertDealerOwnsEnquiry(enquiryId, userProfile.profile.id)
  const conversation = await getOrCreateDirectConversation(enquiry.buyer_id, {
    type: "enquiry",
    id: enquiryId,
  })
  return conversation
}

/**
 * Sends a quotation to the buyer using the existing 'quotation' message
 * type + metadata JSONB, instead of a new quotes table.
 */
export async function sendEnquiryQuotation(
  enquiryId: string,
  quote: { price?: number | null; deliveryDays?: number | null; warranty?: string; remarks?: string }
) {
  console.log("sendEnquiryQuotation payload:", { enquiryId, quote })

  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) throw new Error("Unauthorized")

  await assertDealerOwnsEnquiry(enquiryId, userProfile.profile.id)

  const sanitizedPrice = typeof quote.price === "number" && !Number.isNaN(quote.price) ? quote.price : null
  const sanitizedDeliveryDays = typeof quote.deliveryDays === "number" && !Number.isNaN(quote.deliveryDays) ? quote.deliveryDays : null

  try {
    const conversation = await getOrCreateEnquiryConversation(enquiryId)
    const message = await sendMessage(conversation.id, {
      messageType: "quotation",
      content: quote.remarks || "Quotation sent",
      metadata: {
        price: sanitizedPrice,
        delivery_days: sanitizedDeliveryDays,
        warranty: quote.warranty || null,
        remarks: quote.remarks || null,
      },
    })

    revalidatePath(`/dealer/enquiries/${enquiryId}`)
    return { conversationId: conversation.id, message }
  } catch (error: any) {
    console.error("Send quotation error:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      error,
    })
    throw error
  }
}
