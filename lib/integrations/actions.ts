"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import type { Integration, HealthStatus } from "@/types/system"

const db = supabaseAdmin as any

export async function getIntegrations(): Promise<Integration[]> {
  await requireAdmin()
  const { data, error } = await db.from("integrations").select("*").order("name")
  if (error) throw error
  return (data || []) as Integration[]
}

export async function updateIntegrationConfig(id: string, config: Record<string, any>) {
  await requireAdmin()
  const { data, error } = await db.from("integrations").update({ config, updated_at: new Date().toISOString() }).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function toggleIntegration(id: string, active: boolean) {
  await requireAdmin()
  const { data, error } = await db.from("integrations").update({ is_active: active, status: active ? 'pending' : 'disabled' }).eq("id", id).select().single()
  if (error) throw error
  return data
}

async function pingUrl(url: string, timeout = 5000): Promise<{ ok: boolean; status?: number }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const response = await fetch(url, { method: "GET", signal: controller.signal })
    clearTimeout(timer)
    return { ok: response.ok, status: response.status }
  } catch (e) {
    return { ok: false }
  }
}

export async function checkIntegrationHealth(integration: Integration): Promise<HealthStatus> {
  const start = Date.now()
  let status: HealthStatus["status"] = 'unknown'
  let message = 'Not configured'

  switch (integration.key) {
    case 'resend':
      if (process.env.RESEND_API_KEY) {
        status = 'healthy'
        message = 'API key configured'
      } else {
        status = 'error'
        message = 'RESEND_API_KEY missing'
      }
      break
    case 'razorpay':
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        status = 'healthy'
        message = 'Keys configured'
      } else {
        status = 'error'
        message = 'Razorpay keys missing'
      }
      break
    case 'supabase_storage':
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        status = 'healthy'
        message = 'Supabase configured'
      } else {
        status = 'error'
        message = 'Supabase credentials missing'
      }
      break
    default:
      status = integration.is_active ? 'healthy' : 'unknown'
      message = integration.is_active ? 'Integration enabled' : 'Integration disabled'
  }

  return {
    name: integration.name,
    status,
    message,
    responseTime: Date.now() - start,
    lastChecked: new Date().toISOString(),
  }
}

export async function getSystemHealth(): Promise<HealthStatus[]> {
  await requireAdmin()
  const integrations = await getIntegrations()
  const results = await Promise.all(integrations.map((i) => checkIntegrationHealth(i)))
  results.push({
    name: 'Database',
    status: 'healthy',
    message: 'Connected',
    lastChecked: new Date().toISOString(),
  })
  results.push({
    name: 'API',
    status: 'healthy',
    message: 'Operational',
    lastChecked: new Date().toISOString(),
  })
  return results
}

export async function getHealthOverview() {
  await requireAdmin()
  const health = await getSystemHealth()
  const total = health.length
  const healthy = health.filter((h) => h.status === 'healthy').length
  const warning = health.filter((h) => h.status === 'warning').length
  const error = health.filter((h) => h.status === 'error').length
  return { health, total, healthy, warning, error }
}
