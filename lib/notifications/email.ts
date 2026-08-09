import type { EmailTemplate } from "@/types/notifications"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "Feenix Repair <noreply@feenixrepair.com>"

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured. Email not sent.")
    return null
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Resend API error ${res.status}: ${body}`)
    }

    return await res.json()
  } catch (error: any) {
    console.error("Failed to send email:", error)
    throw error
  }
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; margin: 0; padding: 40px 20px; color: #111827; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #f97316; padding: 24px; color: #fff; text-align: center; }
    .body { padding: 32px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #6b7280; background: #f9fafb; }
    .btn { display: inline-block; padding: 12px 24px; background: #f97316; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Feenix Repair</h1></div>
    <div class="body">${content}</div>
    <div class="footer">© Feenix Repair. All rights reserved.</div>
  </div>
</body>
</html>`
}

export function getWelcomeEmail(name: string): EmailTemplate {
  return {
    subject: "Welcome to Feenix Repair",
    html: baseTemplate(`
      <h2>Hello ${name},</h2>
      <p>Welcome to the Feenix Repair B2B platform. Your account is ready.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}" class="btn">Get Started</a>
    `),
  }
}

export function getPasswordResetEmail(link: string): EmailTemplate {
  return {
    subject: "Reset your Feenix Repair password",
    html: baseTemplate(`
      <h2>Password reset requested</h2>
      <p>Click the button below to reset your password. This link is valid for a short time.</p>
      <a href="${link}" class="btn">Reset Password</a>
    `),
  }
}

export function getOrderConfirmationEmail(orderNumber: string, total: number): EmailTemplate {
  return {
    subject: `Order ${orderNumber} confirmed`,
    html: baseTemplate(`
      <h2>Order confirmed</h2>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <p>Total amount: <strong>₹${total.toLocaleString("en-IN")}</strong></p>
    `),
  }
}

export function getPaymentReceiptEmail(orderNumber: string, amount: number): EmailTemplate {
  return {
    subject: `Payment received for ${orderNumber}`,
    html: baseTemplate(`
      <h2>Payment received</h2>
      <p>We received your payment of <strong>₹${amount.toLocaleString("en-IN")}</strong> for order <strong>${orderNumber}</strong>.</p>
    `),
  }
}

export function getInvoiceEmail(invoiceNumber: string, total: number, link: string): EmailTemplate {
  return {
    subject: `Invoice ${invoiceNumber}`,
    html: baseTemplate(`
      <h2>Your invoice is ready</h2>
      <p>Invoice <strong>${invoiceNumber}</strong> has been generated for <strong>₹${total.toLocaleString("en-IN")}</strong>.</p>
      <a href="${link}" class="btn">Download Invoice</a>
    `),
  }
}

export function getDealerAssignmentEmail(dealerName: string, orderNumber: string): EmailTemplate {
  return {
    subject: `Order ${orderNumber} assigned to you`,
    html: baseTemplate(`
      <h2>Hello ${dealerName},</h2>
      <p>You have been assigned a new order <strong>${orderNumber}</strong>.</p>
    `),
  }
}

export async function sendNotificationEmail(to: string, title: string, message: string, link?: string) {
  return sendEmail({
    to,
    subject: title,
    html: baseTemplate(`
      <h2>${title}</h2>
      <p>${message}</p>
      ${link ? `<a href="${link}" class="btn">View</a>` : ""}
    `),
  })
}
