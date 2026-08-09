"use server"

import { createHmac, randomBytes } from "crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin, getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import type { ApiKey, ApiKeyUsageLog } from "@/types/system"

const db = supabaseAdmin as any

export async function getApiKeys(): Promise<ApiKey[]> {
  await requireAdmin()
  const { data, error } = await db.from("api_keys").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data || []) as ApiKey[]
}

export async function createApiKey(input: { name: string; permissions?: string[]; expires_at?: string }) {
  await requireAdmin()
  const user = await getCurrentUserProfile()
  const plain = `fk_${randomBytes(32).toString('hex')}`
  const key_hash = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "secret").update(plain).digest("hex")
  const key_preview = `${plain.slice(0, 8)}...${plain.slice(-4)}`

  const { data, error } = await db.from("api_keys").insert({
    name: input.name,
    key_hash,
    key_preview,
    permissions: input.permissions || ['read'],
    expires_at: input.expires_at,
    created_by: user?.user?.id,
  }).select().single()
  if (error) throw error
  return { ...data, plain }
}

export async function revokeApiKey(id: string) {
  await requireAdmin()
  const { data, error } = await db
    .from("api_keys")
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteApiKey(id: string) {
  await requireAdmin()
  const { error } = await db.from("api_keys").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function validateApiKey(plainKey: string) {
  const key_hash = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "secret").update(plainKey).digest("hex")
  const { data, error } = await db
    .from("api_keys")
    .select("*")
    .eq("key_hash", key_hash)
    .eq("is_active", true)
    .single()
  if (error || !data) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  await db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id)
  return data as ApiKey
}

export async function logApiUsage(apiKeyId: string, endpoint: string, method: string, status: number, ip?: string) {
  try {
    await db.from("api_key_usage_logs").insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status,
      ip,
    })
  } catch (e) {}
}

export async function getApiKeyUsage(apiKeyId: string, limit = 50): Promise<ApiKeyUsageLog[]> {
  await requireAdmin()
  const { data, error } = await db
    .from("api_key_usage_logs")
    .select("*")
    .eq("api_key_id", apiKeyId)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []) as ApiKeyUsageLog[]
}
