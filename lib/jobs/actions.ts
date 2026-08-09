"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import type { SystemJob, ScheduledTask } from "@/types/system"
import { sendQueuedEmails } from "@/lib/email/service"

const db = supabaseAdmin as any

export async function getJobs(filters: { status?: string; type?: string; limit?: number } = {}) {
  await requireAdmin()
  const limit = filters.limit || 50
  let query = db.from("system_jobs").select("*").order("created_at", { ascending: false }).limit(limit)
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.type) query = query.eq("type", filters.type)
  const { data, error } = await query
  if (error) throw error
  return (data || []) as SystemJob[]
}

export async function createJob(input: { name: string; type: string; payload?: any; priority?: number; scheduled_at?: string }) {
  await requireAdmin()
  const { data, error } = await db.from("system_jobs").insert({
    name: input.name,
    type: input.type,
    payload: input.payload || {},
    priority: input.priority || 0,
    scheduled_at: input.scheduled_at || new Date().toISOString(),
    status: 'pending',
    attempts: 0,
    max_attempts: 3,
  }).select().single()
  if (error) throw error
  return data
}

export async function retryJob(id: string) {
  await requireAdmin()
  const { data, error } = await db
    .from("system_jobs")
    .update({ status: 'pending', attempts: 0, error_message: null, scheduled_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelJob(id: string) {
  await requireAdmin()
  const { data, error } = await db.from("system_jobs").update({ status: 'cancelled' }).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function deleteJob(id: string) {
  await requireAdmin()
  const { error } = await db.from("system_jobs").delete().eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function processJobs(limit = 10) {
  await requireAdmin()
  const { data, error } = await db
    .from("system_jobs")
    .select("*")
    .in("status", ['pending', 'failed'])
    .lte("scheduled_at", new Date().toISOString())
    .order("priority", { ascending: false })
    .limit(limit)
  if (error) throw error

  const results = []
  for (const job of data || []) {
    const start = Date.now()
    try {
      await db.from("system_jobs").update({ status: 'running', started_at: new Date().toISOString() }).eq("id", job.id)
      const result = await executeJob(job)
      await db
        .from("system_jobs")
        .update({ status: 'completed', completed_at: new Date().toISOString(), error_message: null })
        .eq("id", job.id)
      results.push({ id: job.id, success: true, duration: Date.now() - start, result })
    } catch (e: any) {
      const attempts = (job.attempts || 0) + 1
      await db
        .from("system_jobs")
        .update({
          status: attempts >= job.max_attempts ? 'failed' : 'pending',
          attempts,
          error_message: e.message,
          scheduled_at: new Date(Date.now() + attempts * 5 * 60 * 1000).toISOString(),
        })
        .eq("id", job.id)
      results.push({ id: job.id, success: false, error: e.message })
    }
  }
  return results
}

async function executeJob(job: SystemJob): Promise<any> {
  switch (job.type) {
    case 'email_queue':
      return sendQueuedEmails(50)
    case 'cleanup':
      return cleanupLogs()
    case 'inventory_sync':
      return { message: 'Inventory sync executed (placeholder)' }
    case 'payment_reconciliation':
      return { message: 'Payment reconciliation executed (placeholder)' }
    case 'report_generation':
      return { message: 'Report generation executed (placeholder)' }
    default:
      return { message: 'Job executed without side effects' }
  }
}

async function cleanupLogs() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  await db.from("email_logs").delete().lt("created_at", cutoff)
  await db.from("webhook_logs").delete().lt("created_at", cutoff)
  await db.from("system_audit_logs").delete().lt("created_at", cutoff)
  return { message: 'Old logs cleaned' }
}

export async function getScheduledTasks(): Promise<ScheduledTask[]> {
  await requireAdmin()
  const { data, error } = await db.from("scheduled_tasks").select("*").order("name")
  if (error) throw error
  return (data || []) as ScheduledTask[]
}

export async function toggleScheduledTask(id: string, active: boolean) {
  await requireAdmin()
  const { data, error } = await db.from("scheduled_tasks").update({ is_active: active }).eq("id", id).select().single()
  if (error) throw error
  return data
}
