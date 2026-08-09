"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin, getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import type { SystemAuditLog } from "@/types/system"

const db = supabaseAdmin as any

export async function logSystemAudit(payload: Partial<SystemAuditLog>) {
  const user = await getCurrentUserProfile().catch(() => null)
  await db.from("system_audit_logs").insert({
    user_id: user?.user?.id,
    actor_role: user?.profile?.role,
    action: payload.action || 'system_action',
    entity_type: payload.entity_type || 'system',
    entity_id: payload.entity_id,
    status: payload.status,
    metadata: payload.metadata || {},
    ip: payload.ip,
  })
}

export async function getSystemAuditLogs(filters: { entityType?: string; search?: string; limit?: number } = {}) {
  await requireAdmin()
  const limit = filters.limit || 100
  let query = db.from("system_audit_logs").select("*").order("created_at", { ascending: false }).limit(limit)
  if (filters.entityType) query = query.eq("entity_type", filters.entityType)
  if (filters.search) {
    query = query.or(`action.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return (data || []) as SystemAuditLog[]
}
