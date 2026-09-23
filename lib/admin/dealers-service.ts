"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { logActivity } from "@/lib/activity/service"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import {
  notifyDealerVerified,
  notifyDealerRejected,
  notifyDealerSuspended,
  notifyDealerReactivated,
  logDealerActivity,
} from "@/lib/notifications/dealer-product-notifications"
import type { AdminDealer, DealerStatus } from "@/components/admin/dealers/data"
import type { Profile } from "@/types"

function toDealerStatus(dealerStatus: string | null): DealerStatus {
  if (!dealerStatus) return "PENDING"
  // Map database status to UI status
  switch (dealerStatus) {
    case "PENDING":
      return "PENDING"
    case "VERIFIED":
      return "VERIFIED"
    case "REJECTED":
      return "REJECTED"
    case "SUSPENDED":
      return "SUSPENDED"
    default:
      return "PENDING"
  }
}

function withFallback(value: string | null | undefined): string {
  return value?.trim() || "—"
}

async function getProductCount(dealerId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("dealer_id", dealerId)

  if (error) {
    console.error("Dealer Service - Failed to count products:", error)
    return 0
  }

  return count || 0
}

async function getOrderCount(dealerId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .or(`buyer_id.eq.${dealerId},seller_id.eq.${dealerId}`)

  if (error) {
    console.error("Dealer Service - Failed to count orders:", error)
    return 0
  }

  return count || 0
}

function toAdminDealer(profile: Profile, productsCount: number, ordersCount: number): AdminDealer {
  return {
    id: profile.id,
    business_name: withFallback(profile.business_name),
    owner_name: withFallback(profile.name),
    business_type: "—",
    gst: withFallback(profile.gst_number),
    pan: "—",
    phone: withFallback(profile.phone),
    email: profile.email,
    address: withFallback(profile.address),
    city: withFallback(profile.city),
    state: withFallback(profile.state),
    pincode: withFallback(profile.pincode),
    status: toDealerStatus((profile as any).dealer_status),
    products_count: productsCount,
    orders_count: ordersCount,
    registered_at: profile.created_at,
    logo: profile.profile_image ?? null,
    rejection_reason: (profile as any).rejection_reason || null,
  }
}

export async function getDealers(): Promise<AdminDealer[]> {
  console.log("Dealer Service - Fetching dealers")

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("role", "DEALER")
    .order("business_name", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("Dealer Service - Failed to fetch dealers:", error)
    throw new Error("Failed to fetch dealers")
  }

  const profiles = (data || []) as Profile[]

  const dealers = await Promise.all(
    profiles.map(async (profile) => {
      const [productsCount, ordersCount] = await Promise.all([
        getProductCount(profile.id),
        getOrderCount(profile.id),
      ])
      return toAdminDealer(profile, productsCount, ordersCount)
    })
  )

  return dealers
}

export async function approveDealer(id: string): Promise<void> {
  const { user, profile } = await requireAdmin()
  const { data: dealer } = await supabaseAdmin.from("profiles").select("business_name, email").eq("id", id).single()
  
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      dealer_status: "VERIFIED",
      is_active: true,
      verified_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", id)
  
  if (error) throw new Error(error.message || "Failed to approve dealer")
  
  await logDealerActivity(
    "Verified dealer",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    id,
    dealer?.business_name || "Unknown"
  )
  
  await notifyDealerVerified(id, dealer?.business_name || "Unknown")
  
  revalidatePath("/admin/dealers")
}

export async function rejectDealer(id: string, reason?: string): Promise<void> {
  const { user, profile } = await requireAdmin()
  const { data: dealer } = await supabaseAdmin.from("profiles").select("business_name").eq("id", id).single()
  
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      dealer_status: "REJECTED",
      is_active: false,
      rejection_reason: reason || null,
    })
    .eq("id", id)
  
  if (error) throw new Error(error.message || "Failed to reject dealer")
  
  await logDealerActivity(
    "Rejected dealer",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    id,
    dealer?.business_name || "Unknown"
  )
  
  await notifyDealerRejected(id, dealer?.business_name || "Unknown", reason)
  
  revalidatePath("/admin/dealers")
}

export async function suspendDealer(id: string): Promise<void> {
  const { user, profile } = await requireAdmin()
  const { data: dealer } = await supabaseAdmin.from("profiles").select("business_name").eq("id", id).single()
  
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      dealer_status: "SUSPENDED",
      is_active: false,
      suspended_at: new Date().toISOString(),
    })
    .eq("id", id)
  
  if (error) throw new Error(error.message || "Failed to suspend dealer")
  
  await logDealerActivity(
    "Suspended dealer",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    id,
    dealer?.business_name || "Unknown"
  )
  
  await notifyDealerSuspended(id, dealer?.business_name || "Unknown")
  
  revalidatePath("/admin/dealers")
}

export async function activateDealer(id: string): Promise<void> {
  const { user, profile } = await requireAdmin()
  const { data: dealer } = await supabaseAdmin.from("profiles").select("business_name").eq("id", id).single()
  
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      dealer_status: "VERIFIED",
      is_active: true,
      verified_at: new Date().toISOString(),
      suspended_at: null,
      rejection_reason: null,
    })
    .eq("id", id)
  
  if (error) throw new Error(error.message || "Failed to activate dealer")
  
  await logDealerActivity(
    "Reactivated dealer",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    id,
    dealer?.business_name || "Unknown"
  )
  
  await notifyDealerReactivated(id, dealer?.business_name || "Unknown")
  
  revalidatePath("/admin/dealers")
}

export async function deleteDealer(id: string): Promise<void> {
  const { user, profile } = await requireAdmin()
  const { data: dealer } = await supabaseAdmin.from("profiles").select("business_name").eq("id", id).single()
  
  const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id)
  if (error) throw new Error(error.message || "Failed to delete dealer")
  
  await logDealerActivity(
    "Deleted dealer",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    id,
    dealer?.business_name || "Unknown"
  )
  
  revalidatePath("/admin/dealers")
}
