import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Banner } from "@/types"

const db = supabaseAdmin as any

export type BannerStatus = "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED"

export function getBannerStatus(banner: Banner): BannerStatus {
  if (banner.status !== "ACTIVE") return "INACTIVE"
  
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  
  if (banner.start_date && banner.start_date > today) return "SCHEDULED"
  if (banner.end_date && banner.end_date < today) return "EXPIRED"
  
  return "ACTIVE"
}

export async function getBanners() {
  const { data, error } = await db
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true })
  
  if (error) throw error
  return (data || []) as Banner[]
}

export async function getActiveBanners() {
  const { data, error } = await db
    .from("banners")
    .select("*")
    .eq("status", "ACTIVE")
    .order("display_order", { ascending: true })
  
  if (error) throw error
  
  const banners = (data || []) as Banner[]
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  
  return banners.filter(b => {
    if (b.start_date && b.start_date > today) return false
    if (b.end_date && b.end_date < today) return false
    return true
  })
}

export async function getBannerById(id: string) {
  const { data, error } = await db
    .from("banners")
    .select("*")
    .eq("id", id)
    .single()
  
  if (error) throw error
  return data as Banner
}

export async function createBanner(banner: Omit<Banner, "id" | "created_at" | "updated_at">) {
  const { data, error } = await db
    .from("banners")
    .insert(banner)
    .select()
    .single()
  
  if (error) throw error
  return data as Banner
}

export async function updateBanner(id: string, updates: Partial<Omit<Banner, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await db
    .from("banners")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  
  if (error) throw error
  return data as Banner
}

export async function deleteBanner(id: string) {
  const { error } = await db
    .from("banners")
    .delete()
    .eq("id", id)
  
  if (error) throw error
}

export async function reorderBanners(bannerIds: string[]) {
  const results = await Promise.allSettled(
    bannerIds.map((id, index) =>
      db.from("banners").update({ display_order: index + 1 }).eq("id", id)
    )
  )
  
  const errors = results.filter((r) => r.status === "rejected")
  if (errors.length > 0) {
    throw new Error(`Failed to reorder banners: ${errors.map(e => e.status === "rejected" ? e.reason.message : "Unknown error").join(", ")}`)
  }
}

export async function toggleBannerStatus(id: string) {
  const banner = await getBannerById(id)
  const newStatus = banner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
  
  return updateBanner(id, { status: newStatus })
}
