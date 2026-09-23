import { createServerClient } from "@/lib/supabase/server"
import type { MarketplaceStat } from "@/types"

export async function getActiveMarketplaceStats(): Promise<MarketplaceStat[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("marketplace_stats")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Failed to fetch marketplace stats:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    return (data || []) as MarketplaceStat[]
  } catch (error) {
    console.error("Failed to fetch marketplace stats:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    })
    return []
  }
}
