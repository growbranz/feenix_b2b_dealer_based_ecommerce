export type NotificationType = 'success' | 'warning' | 'error' | 'information' | 'critical'

export type NotificationCategory =
  | 'auth'
  | 'order'
  | 'payment'
  | 'inventory'
  | 'enquiry'
  | 'message'
  | 'dealer'
  | 'product'
  | 'system'
  | 'invoice'

export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string | null
  category: string | null
  source: string | null
  source_id: string | null
  link: string | null
  data: any
  priority: string | null
  is_read: boolean
  archived_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationPreference {
  id: string
  user_id: string
  channel: NotificationChannel
  category: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  status: string | null
  metadata: any
  created_at: string
}

export interface NotificationFilters {
  search?: string
  type?: NotificationType
  category?: NotificationCategory
  isRead?: boolean
  archived?: boolean
  limit?: number
  page?: number
}

export interface NotificationInput {
  userId: string
  title: string
  message: string
  type?: NotificationType
  category?: NotificationCategory
  source?: string
  sourceId?: string
  link?: string | null
  data?: any
  priority?: string
  sendEmail?: boolean
  emailSubject?: string
}

export interface EmailTemplate {
  subject: string
  html: string
}
