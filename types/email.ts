export type EmailTemplateKey =
  | 'welcome'
  | 'email-verification'
  | 'password-reset'
  | 'dealer-approved'
  | 'dealer-rejected'
  | 'customer-registration'
  | 'order-created'
  | 'order-confirmed'
  | 'order-shipped'
  | 'order-delivered'
  | 'invoice-generated'
  | 'payment-success'
  | 'payment-failed'
  | 'refund-completed'
  | 'enquiry-assigned'
  | 'quotation-sent'
  | 'inventory-low'
  | 'notification'

export interface EmailAddress {
  email: string
  name?: string
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer | Uint8Array
  contentType?: string
}

export interface EmailPayload {
  to: string | EmailAddress | (string | EmailAddress)[]
  subject: string
  html: string
  from?: EmailAddress
  replyTo?: string | EmailAddress
  attachments?: EmailAttachment[]
}

export interface SendEmailOptions {
  to: string | string[]
  template: EmailTemplateKey
  data: Record<string, any>
  subject?: string
  from?: string
  replyTo?: string
  attachments?: EmailAttachment[]
}

export interface EmailSettings {
  id?: string
  sender_name: string
  sender_email: string
  reply_to: string
  company_logo?: string | null
  footer_content?: string
  primary_color?: string
  secondary_color?: string
  provider: 'resend' | 'ses' | 'sendgrid' | 'smtp'
  enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface EmailTemplate {
  id?: string
  key: EmailTemplateKey
  name: string
  subject: string
  html: string
  is_active: boolean
  description?: string
  created_at?: string
  updated_at?: string
}

export type EmailLogStatus = 'queued' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'

export interface EmailLog {
  id: string
  recipient: string
  template_key: EmailTemplateKey | string
  subject: string
  status: EmailLogStatus
  provider: string
  provider_message_id?: string | null
  error_message?: string | null
  opened_at?: string | null
  created_at: string
  metadata?: Record<string, any>
}

export interface EmailQueueItem {
  id?: string
  recipient: string
  template_key: string
  subject: string
  html: string
  retry_count: number
  max_retries: number
  status: 'pending' | 'processing' | 'failed' | 'completed'
  error_message?: string
  scheduled_at?: string
  created_at?: string
}

export interface EmailFilters {
  status?: string
  template?: string
  search?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}
