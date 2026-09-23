import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ActivityLog } from "@/types"

const db = supabaseAdmin as any

export type ActivityType =
  | "AUTHENTICATION"
  | "DEALER_ACTION"
  | "PRODUCT_ACTION"
  | "CATEGORY_ACTION"
  | "BRAND_ACTION"
  | "MODEL_ACTION"
  | "ENQUIRY_ACTION"
  | "ORDER_ACTION"
  | "PAYMENT_ACTION"
  | "INVENTORY_ACTION"
  | "BANNER_ACTION"
  | "CMS_ACTION"
  | "FEATURED_ACTION"
  | "SETTINGS_ACTION"
  | "WEBSITE_ACTION"

export interface LogActivityInput {
  type: ActivityType
  action: string
  actor_id?: string | null
  actor_name?: string | null
  actor_role?: string | null
  target_type?: string | null
  target_id?: string | null
  target_name?: string | null
  metadata?: Record<string, any>
}

export async function logActivity(input: LogActivityInput): Promise<ActivityLog> {
  const { data, error } = await db
    .from("activity_logs")
    .insert({
      type: input.type,
      action: input.action,
      actor_id: input.actor_id || null,
      actor_name: input.actor_name || null,
      actor_role: input.actor_role || null,
      target_type: input.target_type || null,
      target_id: input.target_id || null,
      target_name: input.target_name || null,
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) throw error
  return data as ActivityLog
}

export interface ActivityLogsFilterOptions {
  search?: string
  type?: ActivityType | "all"
  actor_id?: string
  target_type?: string
  page?: number
  limit?: number
}

export async function getActivityLogs(options: ActivityLogsFilterOptions = {}) {
  const {
    search,
    type,
    actor_id,
    target_type,
    page = 1,
    limit = 20,
  } = options

  try {
    let query = db
      .from("activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Handle both old (user_id) and new (actor_id) schemas
    if (actor_id) {
      query = query.or(`actor_id.eq.${actor_id},user_id.eq.${actor_id}`)
    }

    // Handle both old (entity_type) and new (target_type) schemas
    if (target_type) {
      query = query.or(`target_type.eq.${target_type},entity_type.eq.${target_type}`)
    }

    // Handle type filter (only in new schema)
    if (type && type !== "all") {
      query = query.eq("type", type)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) {
      console.error("Activity logs query error:", error)
      // Return empty result instead of throwing
      return {
        data: [],
        count: 0,
        page,
        limit,
        totalPages: 1,
      }
    }

    let rows = (data || []) as any[]

    // Normalize rows to handle both old and new schemas
    const normalizedRows = rows.map((row: any) => ({
      id: row.id,
      type: row.type || "LEGACY",
      action: row.action,
      actor_id: row.actor_id || row.user_id || null,
      actor_name: row.actor_name || null,
      actor_role: row.actor_role || null,
      target_type: row.target_type || row.entity_type || null,
      target_id: row.target_id || row.entity_id || null,
      target_name: row.target_name || null,
      metadata: row.metadata || {},
      created_at: row.created_at,
    })) as ActivityLog[]

    if (search?.trim()) {
      const q = search.trim().toLowerCase()
      rows = normalizedRows.filter(
        (log) =>
          log.action.toLowerCase().includes(q) ||
          (log.actor_name && log.actor_name.toLowerCase().includes(q)) ||
          (log.target_name && log.target_name.toLowerCase().includes(q))
      )
    } else {
      rows = normalizedRows
    }

    return {
      data: rows,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit) || 1,
    }
  } catch (error) {
    console.error("Activity logs service error:", error)
    // Return empty result instead of throwing
    return {
      data: [],
      count: 0,
      page,
      limit,
      totalPages: 1,
    }
  }
}

export async function getActivityLogTypes(): Promise<ActivityType[]> {
  try {
    const { data, error } = await db
      .from("activity_logs")
      .select("type")
      .order("type")

    if (error) {
      console.error("Activity log types query error:", error)
      return []
    }

    const types = new Set<ActivityType>()
    ;(data || []).forEach((row: any) => {
      if (row.type) types.add(row.type)
    })

    return Array.from(types)
  } catch (error) {
    console.error("Activity log types service error:", error)
    return []
  }
}
