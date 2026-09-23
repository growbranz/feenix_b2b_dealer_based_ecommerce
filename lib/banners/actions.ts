"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import {
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  toggleBannerStatus,
  getActiveBanners,
} from "./service"
import { logActivity } from "@/lib/activity/service"
import type { Banner } from "@/types"

export async function getBannersAction() {
  return getBanners()
}

export async function getActiveBannersAction() {
  return getActiveBanners()
}

export async function getBannerByIdAction(id: string) {
  return getBannerById(id)
}

export async function createBannerAction(banner: Omit<Banner, "id" | "created_at" | "updated_at">) {
  const { user, profile } = await requireAdmin()
  const result = await createBanner(banner)
  
  await logActivity({
    type: "BANNER_ACTION",
    action: "Created banner",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "banner",
    target_id: result.id,
    target_name: result.title,
  })
  
  revalidatePath("/admin/banners")
  revalidatePath("/")
  return result
}

export async function updateBannerAction(id: string, updates: Partial<Omit<Banner, "id" | "created_at" | "updated_at">>) {
  const { user, profile } = await requireAdmin()
  const existing = await getBannerById(id)
  const result = await updateBanner(id, updates)
  
  await logActivity({
    type: "BANNER_ACTION",
    action: "Updated banner",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "banner",
    target_id: id,
    target_name: existing.title,
  })
  
  revalidatePath("/admin/banners")
  revalidatePath("/")
  return result
}

export async function deleteBannerAction(id: string) {
  const { user, profile } = await requireAdmin()
  const existing = await getBannerById(id)
  await deleteBanner(id)
  
  await logActivity({
    type: "BANNER_ACTION",
    action: "Deleted banner",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "banner",
    target_id: id,
    target_name: existing.title,
  })
  
  revalidatePath("/admin/banners")
  revalidatePath("/")
}

export async function reorderBannersAction(bannerIds: string[]) {
  const { user, profile } = await requireAdmin()
  await reorderBanners(bannerIds)
  
  await logActivity({
    type: "BANNER_ACTION",
    action: "Reordered banners",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "banner",
    target_id: null,
    target_name: "Banner order",
  })
  
  revalidatePath("/admin/banners")
  revalidatePath("/")
}

export async function toggleBannerStatusAction(id: string) {
  const { user, profile } = await requireAdmin()
  const existing = await getBannerById(id)
  const result = await toggleBannerStatus(id)
  
  await logActivity({
    type: "BANNER_ACTION",
    action: result.status === "ACTIVE" ? "Activated banner" : "Deactivated banner",
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "banner",
    target_id: id,
    target_name: existing.title,
  })
  
  revalidatePath("/admin/banners")
  revalidatePath("/")
  return result
}
