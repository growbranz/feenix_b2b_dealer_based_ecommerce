"use server"

import { requireAdmin } from "@/lib/auth/auth.helpers"
import {
  getMarketplaceStats,
  createMarketplaceStat,
  updateMarketplaceStat,
  deleteMarketplaceStat,
  reorderMarketplaceStats,
  toggleMarketplaceStatStatus,
} from "./service"
import { logActivity, type ActivityType } from "@/lib/activity/service"
import type { MarketplaceStat } from "@/types"

export async function getMarketplaceStatsAction(isActive?: boolean) {
  try {
    return getMarketplaceStats({ is_active: isActive })
  } catch (error) {
    console.error("Failed to fetch marketplace stats:", error)
    return []
  }
}

export async function createMarketplaceStatAction(
  stat: Omit<MarketplaceStat, "id" | "created_at" | "updated_at">
) {
  try {
    const { user } = await requireAdmin()
    const created = await createMarketplaceStat(stat)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "marketplace_stat_created",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "MarketplaceStat",
        target_id: created.id,
        target_name: created.label,
        metadata: {
          stat_key: created.stat_key,
          value: created.value,
        },
      })
    } catch (logError) {
      console.error("[Marketplace Stats] Activity logging failed (non-critical):", logError)
    }

    return created
  } catch (error) {
    console.error("[Marketplace Stats] Failed to create marketplace stat:", error)
    throw error
  }
}

export async function updateMarketplaceStatAction(
  id: string,
  updates: Partial<Omit<MarketplaceStat, "id" | "created_at" | "updated_at">>,
  previousValue?: string
) {
  try {
    const { user } = await requireAdmin()
    const updated = await updateMarketplaceStat(id, updates)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "marketplace_stat_updated",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "MarketplaceStat",
        target_id: updated.id,
        target_name: updated.label,
        metadata: {
          stat_key: updated.stat_key,
          previous_value: previousValue,
          new_value: updated.value,
        },
      })
    } catch (logError) {
      console.error("[Marketplace Stats] Activity logging failed (non-critical):", logError)
    }

    return updated
  } catch (error) {
    console.error("[Marketplace Stats] Failed to update marketplace stat:", error)
    throw error
  }
}

export async function deleteMarketplaceStatAction(id: string) {
  try {
    const { user } = await requireAdmin()
    const stat = await getMarketplaceStats()
    const toDelete = stat.find((s) => s.id === id)

    if (!toDelete) {
      throw new Error("Marketplace stat not found")
    }

    await deleteMarketplaceStat(id)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "marketplace_stat_deleted",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "MarketplaceStat",
        target_id: id,
        target_name: toDelete.label,
        metadata: {
          stat_key: toDelete.stat_key,
          value: toDelete.value,
        },
      })
    } catch (logError) {
      console.error("[Marketplace Stats] Activity logging failed (non-critical):", logError)
    }
  } catch (error) {
    console.error("[Marketplace Stats] Failed to delete marketplace stat:", error)
    throw error
  }
}

export async function reorderMarketplaceStatsAction(ids: string[]) {
  try {
    const { user } = await requireAdmin()
    await reorderMarketplaceStats(ids)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "marketplace_stat_reordered",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "MarketplaceStat",
        metadata: {
          new_order: ids,
        },
      })
    } catch (logError) {
      console.error("[Marketplace Stats] Activity logging failed (non-critical):", logError)
    }
  } catch (error) {
    console.error("[Marketplace Stats] Failed to reorder marketplace stats:", error)
    throw error
  }
}

export async function toggleMarketplaceStatStatusAction(id: string) {
  try {
    const { user } = await requireAdmin()
    const updated = await toggleMarketplaceStatStatus(id)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "marketplace_stat_status_changed",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "MarketplaceStat",
        target_id: updated.id,
        target_name: updated.label,
        metadata: {
          stat_key: updated.stat_key,
          is_active: updated.is_active,
        },
      })
    } catch (logError) {
      console.error("[Marketplace Stats] Activity logging failed (non-critical):", logError)
    }

    return updated
  } catch (error) {
    console.error("[Marketplace Stats] Failed to toggle marketplace stat status:", error)
    throw error
  }
}
