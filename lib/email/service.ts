"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { getEmailProvider } from "./provider"
import { compileTemplate } from "./templates"
import type { SendEmailOptions, EmailLogStatus } from "@/types/email"

const db = supabaseAdmin as any

async function getSettings() {
  const { data, error } = await db.from("email_settings").select("*").single()
  if (error || !data) {
    return {
      sender_name: "Fenix Repair",
      sender_email: "noreply@feenixrepair.com",
      reply_to: "support@feenixrepair.com",
      provider: "resend",
      enabled: true,
    }
  }
  return data
}

async function logEmail(
  recipient: string,
  templateKey: string,
  subject: string,
  html: string,
  status: EmailLogStatus,
  provider: string,
  providerMessageId?: string,
  errorMessage?: string,
  metadata?: any
) {
  try {
    await db.from("email_logs").insert({
      recipient,
      template_key: templateKey,
      subject,
      html,
      status,
      provider,
      provider_message_id: providerMessageId,
      error_message: errorMessage,
      metadata,
    })
  } catch (e: any) {
    console.warn("Failed to log email", e.message)
  }
}

async function queueEmail(recipient: string, templateKey: string, subject: string, html: string, error: string) {
  try {
    await db.from("email_queue").insert({
      recipient,
      template_key: templateKey,
      subject,
      html,
      retry_count: 0,
      max_retries: 3,
      status: "pending",
      error_message: error,
      scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
  } catch (e: any) {
    console.warn("Failed to queue email", e.message)
  }
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const settings = await getSettings()
  if (!settings.enabled) {
    return { success: false, error: "Email sending is disabled" }
  }

  const fromEmail = options.from || settings.sender_email || "noreply@feenixrepair.com"
  const fromName = settings.sender_name || "Feenix Repair"

  const toList = Array.isArray(options.to) ? options.to : [options.to]
  const { subject, html } = compileTemplate(options.template, options.data || {}, settings)

  const provider = await getEmailProvider()

  const results = await Promise.all(
    toList.map(async (to) => {
      const result = await provider.send({
        to,
        from: { email: fromEmail, name: fromName },
        replyTo: options.replyTo || settings.reply_to,
        subject: options.subject || subject,
        html,
        attachments: options.attachments,
      })
      await logEmail(
        to,
        options.template,
        options.subject || subject,
        html,
        result.success ? "sent" : "failed",
        settings.provider,
        result.id,
        result.error,
        options.data
      )
      if (!result.success) {
        await queueEmail(to, options.template, options.subject || subject, html, result.error || "unknown")
      }
      return { to, ...result }
    })
  )

  const failed = results.filter((r) => !r.success)
  if (failed.length > 0) {
    return { success: false, error: failed.map((f) => `${f.to}: ${f.error}`).join(", ") }
  }
  return { success: true, id: results[0]?.id }
}

export async function sendQueuedEmails(limit = 50): Promise<{ processed: number; failed: number }> {
  const { data: items, error } = await db
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(limit)
  if (error) throw error

  let processed = 0
  let failed = 0
  const provider = await getEmailProvider()

  for (const item of items || []) {
    const result = await provider.send({
      to: item.recipient,
      from: { email: "noreply@feenixrepair.com", name: "Feenix Repair" },
      subject: item.subject,
      html: item.html,
    })

    if (result.success) {
      processed++
      await db.from("email_queue").delete().eq("id", item.id)
      await logEmail(item.recipient, item.template_key, item.subject, item.html, "delivered", "resend", result.id)
    } else {
      failed++
      const nextRetry = item.retry_count + 1
      if (nextRetry >= item.max_retries) {
        await db.from("email_queue").update({ status: "failed", retry_count: nextRetry, error_message: result.error }).eq("id", item.id)
      } else {
        await db
          .from("email_queue")
          .update({
            retry_count: nextRetry,
            scheduled_at: new Date(Date.now() + nextRetry * 10 * 60 * 1000).toISOString(),
            error_message: result.error,
          })
          .eq("id", item.id)
      }
    }
  }

  return { processed, failed }
}
