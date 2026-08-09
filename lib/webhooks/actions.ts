"use server"

import { createHmac } from "crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin, getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import type { Webhook, WebhookLog } from "@/types/system"

const db = supabaseAdmin as any

function generateSecret() {
  const bytes = new Uint8Array(32)
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  return Buffer.from(bytes).toString('hex')
}

export async function getWebhooks(): Promise<Webhook[]> {
  await requireAdmin()
  const { data, error } = await db.from("webhooks").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return (data || []) as Webhook[]
}

export async function createWebhook(input: { name: string; url: string; event: string; retry_count: number }) {
  await requireAdmin()
  const user = await getCurrentUserProfile()
  const { data, error } = await db.from("webhooks").insert({
    ...input,
    secret: generateSecret(),
    created_by: user?.user?.id,
  }).select().single()
  if (error) throw error
  return data
}

export async function updateWebhook(id: string, input: Partial<Webhook>) {
  await requireAdmin()
  const { data, error } = await db.from("webhooks").update(input).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteWebhook(id: string) {
  await requireAdmin()
  const { error } = await db.from("webhooks").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function getWebhookLogs(filters: { webhookId?: string; status?: string; limit?: number } = {}) {
  await requireAdmin()
  const limit = filters.limit || 50
  let query = db.from("webhook_logs").select("*").order("created_at", { ascending: false }).limit(limit)
  if (filters.webhookId) query = query.eq("webhook_id", filters.webhookId)
  if (filters.status) query = query.eq("status", filters.status)
  const { data, error } = await query
  if (error) throw error
  return (data || []) as WebhookLog[]
}

export async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  const sig = signature.startsWith("sha256=") ? signature.slice(7) : signature
  return sig === expected
}

export async function dispatchWebhook(webhook: Webhook, event: string, payload: any) {
  const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() })
  const signature = createHmac("sha256", webhook.secret || "").update(body).digest("hex")

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": `sha256=${signature}`,
      },
      body,
    })
    const responseText = await response.text().catch(() => "")
    const status = response.ok ? 'success' : 'failed'
    await db.from("webhook_logs").insert({
      webhook_id: webhook.id,
      event,
      payload,
      status,
      response_status: response.status,
      response_body: responseText,
    })
    return { success: response.ok, status: response.status }
  } catch (e: any) {
    await db.from("webhook_logs").insert({
      webhook_id: webhook.id,
      event,
      payload,
      status: 'failed',
      response_body: e.message,
    })
    return { success: false, error: e.message }
  }
}

export async function retryFailedWebhooks() {
  await requireAdmin()
  const { data, error } = await db.from("webhook_logs").select("*, webhook:webhooks(*)").eq("status", 'failed').limit(50)
  if (error) throw error

  const results = []
  for (const log of data || []) {
    if (!log.webhook?.is_active) continue
    const result = await dispatchWebhook(log.webhook, log.event, log.payload)
    results.push({ logId: log.id, ...result })
    await db.from("webhook_logs").update({ retry_count: (log.retry_count || 0) + 1 }).eq("id", log.id)
  }
  return results
}
