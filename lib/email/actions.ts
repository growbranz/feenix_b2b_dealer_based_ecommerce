"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin, getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { sendEmail, sendQueuedEmails } from "./service"
import { compileTemplate } from "./templates"
import type { EmailFilters, EmailSettings, EmailTemplate, EmailQueueItem } from "@/types/email"

const db = supabaseAdmin as any

export async function getEmailSettings(): Promise<EmailSettings> {
  await requireAdmin()
  const { data, error } = await db.from("email_settings").select("*").single()
  if (error || !data) {
    return {
      sender_name: "Feenix Repair",
      sender_email: "noreply@feenixrepair.com",
      reply_to: "support@feenixrepair.com",
      provider: "resend",
      enabled: true,
    }
  }
  return data as EmailSettings
}

export async function saveEmailSettings(settings: EmailSettings) {
  await requireAdmin()
  const { data: existing } = await db.from("email_settings").select("id").single()
  if (existing) {
    const { data, error } = await db.from("email_settings").update(settings).eq("id", existing.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await db.from("email_settings").insert(settings).select().single()
  if (error) throw error
  return data
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  await requireAdmin()
  const { data, error } = await db.from("email_templates").select("*").order("name")
  if (error) throw error
  return (data || []) as EmailTemplate[]
}

export async function saveEmailTemplate(template: EmailTemplate) {
  await requireAdmin()
  if (template.id) {
    const { data, error } = await db.from("email_templates").update(template).eq("id", template.id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await db.from("email_templates").insert(template).select().single()
  if (error) throw error
  return data
}

export async function deleteEmailTemplate(id: string) {
  await requireAdmin()
  const { error } = await db.from("email_templates").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function getEmailLogs(filters: EmailFilters = {}) {
  await requireAdmin()
  const page = filters.page || 1
  const limit = filters.limit || 25
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = db.from("email_logs").select("*", { count: "exact" }).order("created_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.template) query = query.eq("template_key", filters.template)
  if (filters.search) query = query.or(`recipient.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)
  if (filters.from) query = query.gte("created_at", filters.from)
  if (filters.to) query = query.lte("created_at", filters.to)

  const { data, error, count } = await query.range(from, to)
  if (error) throw error
  return { data: (data || []) as any[], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) }
}

export async function getEmailQueue(filters: EmailFilters = {}) {
  await requireAdmin()
  const page = filters.page || 1
  const limit = filters.limit || 25
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = db.from("email_queue").select("*", { count: "exact" }).order("created_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.template) query = query.eq("template_key", filters.template)

  const { data, error, count } = await query.range(from, to)
  if (error) throw error
  return { data: (data || []) as EmailQueueItem[], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) }
}

export async function retryEmailQueue() {
  await requireAdmin()
  return sendQueuedEmails(50)
}

export async function sendTestEmail({ to, template, data }: { to: string; template: any; data: Record<string, any> }) {
  await requireAdmin()
  return sendEmail({ to, template, data })
}

export async function getEmailStats() {
  await requireAdmin()
  const { data: sent } = await db.from("email_logs").select("id", { count: "exact", head: true }).eq("status", "sent")
  const { data: delivered } = await db.from("email_logs").select("id", { count: "exact", head: true }).eq("status", "delivered")
  const { data: failed } = await db.from("email_logs").select("id", { count: "exact", head: true }).in("status", ["failed", "bounced"])
  const { data: queued } = await db.from("email_queue").select("id", { count: "exact", head: true }).eq("status", "pending")
  return {
    sent: sent || 0,
    delivered: delivered || 0,
    failed: failed || 0,
    queued: queued || 0,
  }
}
