import { supabaseAdmin } from "@/lib/supabase/admin"
import type { MarketplaceStat } from "@/types"

const db = supabaseAdmin as any

export interface MarketplaceStatsFilterOptions {
  is_active?: boolean
}

// Helper function to convert string to snake_case for stat_key
function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export async function getMarketplaceStats(options: MarketplaceStatsFilterOptions = {}): Promise<MarketplaceStat[]> {
  try {
    let query = db
      .from("marketplace_stats")
      .select("*")
      .order("display_order", { ascending: true })

    if (options.is_active !== undefined) {
      query = query.eq("is_active", options.is_active)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as MarketplaceStat[]
  } catch (error) {
    console.error("Failed to fetch marketplace stats:", error)
    return []
  }
}

export async function getMarketplaceStatById(id: string): Promise<MarketplaceStat | null> {
  try {
    const { data, error } = await db
      .from("marketplace_stats")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as MarketplaceStat
  } catch (error) {
    console.error("Failed to fetch marketplace stat:", error)
    return null
  }
}

export async function createMarketplaceStat(
  stat: Omit<MarketplaceStat, "id" | "created_at" | "updated_at">
): Promise<MarketplaceStat> {
  // Auto-convert stat_key to snake_case for consistency
  const normalizedStat = {
    ...stat,
    stat_key: toSnakeCase(stat.stat_key),
  }
  
  const { data, error } = await db
    .from("marketplace_stats")
    .insert(normalizedStat)
    .select()
    .single()

  if (error) {
    console.error("[Marketplace Stats] Supabase INSERT error:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      stat_key: normalizedStat.stat_key,
      label: stat.label,
    })
    throw error
  }
  return data as MarketplaceStat
}

export async function updateMarketplaceStat(
  id: string,
  updates: Partial<Omit<MarketplaceStat, "id" | "created_at" | "updated_at">>
): Promise<MarketplaceStat> {
  const { data, error } = await db
    .from("marketplace_stats")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[Marketplace Stats] Supabase UPDATE error:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      id: id,
      updates: updates,
    })
    throw error
  }
  return data as MarketplaceStat
}

export async function deleteMarketplaceStat(id: string): Promise<void> {
  const { error } = await db
    .from("marketplace_stats")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function reorderMarketplaceStats(ids: string[]): Promise<void> {
  const updates = ids.map((id, index) => ({
    id,
    display_order: index + 1,
  }))

  const { error } = await db
    .from("marketplace_stats")
    .upsert(updates, { onConflict: "id" })

  if (error) throw error
}

export async function toggleMarketplaceStatStatus(id: string): Promise<MarketplaceStat> {
  const stat = await getMarketplaceStatById(id)
  if (!stat) throw new Error("Marketplace stat not found")

  return updateMarketplaceStat(id, { is_active: !stat.is_active })
}

// Icon mapping from database strings to Lucide icon components
export const ICON_MAP: Record<string, string> = {
  "package": "Package",
  "users": "Users",
  "award": "Award",
  "shield-check": "ShieldCheck",
  "headphones": "Headphones",
}

export function getIconComponent(iconName: string | null): string {
  if (!iconName) return "Package"
  return ICON_MAP[iconName] || "Package"
}
