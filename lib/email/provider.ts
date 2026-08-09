import { supabaseAdmin } from "@/lib/supabase/admin"

export interface ProviderSendResult {
  id?: string
  success: boolean
  error?: string
}

export interface EmailProvider {
  send(email: {
    to: string | string[]
    from: { email: string; name?: string }
    replyTo?: string
    subject: string
    html: string
    attachments?: any[]
  }): Promise<ProviderSendResult>
}

class ResendProvider implements EmailProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async send(payload: any): Promise<ProviderSendResult> {
    if (!this.apiKey) {
      return { success: false, error: "Resend API key not configured" }
    }

    const body: any = {
      from: payload.from.name
        ? `${payload.from.name} <${payload.from.email}>`
        : payload.from.email,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
    }
    if (payload.replyTo) body.reply_to = payload.replyTo
    if (payload.attachments?.length) {
      body.attachments = payload.attachments.map((a: any) => ({
        filename: a.filename,
        content: typeof a.content === "string" ? a.content : a.content.toString("base64"),
      }))
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        return { success: false, error: data.message || `Resend error ${response.status}` }
      }
      return { success: true, id: data.id }
    } catch (err: any) {
      return { success: false, error: err.message || "Resend request failed" }
    }
  }
}

class ConsoleProvider implements EmailProvider {
  async send(payload: any): Promise<ProviderSendResult> {
    console.log("[EMAIL]", payload.from, "->", payload.to, payload.subject)
    return { success: true, id: "console" }
  }
}

export async function getEmailProvider(): Promise<EmailProvider> {
  const db = supabaseAdmin as any
  const { data, error } = await db.from("email_settings").select("*").single()
  const settings = error ? null : data
  const provider = settings?.provider || process.env.EMAIL_PROVIDER || "resend"

  if (provider === "resend") {
    return new ResendProvider(process.env.RESEND_API_KEY || "")
  }

  return new ConsoleProvider()
}
