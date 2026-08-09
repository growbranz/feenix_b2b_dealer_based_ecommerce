export interface Integration {
  id: string
  key: string
  name: string
  provider: string
  config: Record<string, any>
  is_active: boolean
  status: 'pending' | 'active' | 'error' | 'disabled'
  last_checked_at?: string
  last_error?: string
  created_at: string
  updated_at: string
}

export interface Webhook {
  id: string
  name: string
  url: string
  event: string
  secret?: string
  is_active: boolean
  retry_count: number
  created_at: string
  updated_at: string
}

export interface WebhookLog {
  id: string
  webhook_id: string
  event: string
  payload: any
  status: 'pending' | 'success' | 'failed'
  response_status?: number
  response_body?: string
  retry_count: number
  created_at: string
}

export interface ApiKey {
  id: string
  name: string
  key_hash: string
  key_preview: string
  permissions: string[]
  is_active: boolean
  expires_at?: string
  last_used_at?: string
  created_at: string
  revoked_at?: string
}

export interface ApiKeyUsageLog {
  id: string
  api_key_id: string
  endpoint?: string
  method?: string
  status?: number
  ip?: string
  created_at: string
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type JobType = 'email_queue' | 'invoice_generation' | 'report_generation' | 'inventory_sync' | 'payment_reconciliation' | 'notification_queue' | 'cleanup'

export interface SystemJob {
  id: string
  name: string
  type: JobType
  payload: any
  status: JobStatus
  priority: number
  attempts: number
  max_attempts: number
  error_message?: string
  started_at?: string
  completed_at?: string
  scheduled_at?: string
  created_at: string
}

export interface ScheduledTask {
  id: string
  name: string
  cron?: string
  interval_minutes?: number
  job_type: string
  payload: any
  is_active: boolean
  last_run_at?: string
  next_run_at?: string
  created_at: string
}

export interface SystemAuditLog {
  id: string
  user_id?: string
  actor_role?: string
  action: string
  entity_type: string
  entity_id?: string
  status?: string
  metadata?: any
  ip?: string
  created_at: string
}

export interface HealthStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'unknown'
  message?: string
  responseTime?: number
  lastChecked?: string
}
