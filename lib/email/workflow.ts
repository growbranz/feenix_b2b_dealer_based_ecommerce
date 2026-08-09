"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { sendEmail } from "./service"
import type { EmailTemplateKey } from "@/types/email"

const db = supabaseAdmin as any

async function userEmail(userId: string) {
  const { data, error } = await db.from("profiles").select("email, name").eq("id", userId).single()
  if (error || !data?.email) return null
  return data
}

export async function sendWorkflowEmail(userId: string, template: EmailTemplateKey, data: Record<string, any>) {
  const profile = await userEmail(userId)
  if (!profile?.email) return { success: false, error: "No email" }
  return sendEmail({
    to: profile.email,
    template,
    data: { ...data, name: data.name || profile.name },
  })
}

export async function sendWelcomeEmail(userId: string, name?: string) {
  return sendWorkflowEmail(userId, "welcome", { name })
}

export async function sendVerificationEmail(email: string, link: string) {
  return sendEmail({ to: email, template: "email-verification", data: { link } })
}

export async function sendPasswordResetEmail(email: string, link: string) {
  return sendEmail({ to: email, template: "password-reset", data: { link } })
}

export async function sendDealerApprovedEmail(userId: string, name?: string) {
  return sendWorkflowEmail(userId, "dealer-approved", { name })
}

export async function sendDealerRejectedEmail(userId: string, name?: string, reason?: string) {
  return sendWorkflowEmail(userId, "dealer-rejected", { name, reason })
}

export async function sendCustomerRegistrationEmail(userId: string, name?: string) {
  return sendWorkflowEmail(userId, "customer-registration", { name })
}

export async function sendOrderCreatedEmail(userId: string, order: any) {
  return sendWorkflowEmail(userId, "order-created", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    total: order.total,
    status: order.status,
    link: `/dealer/orders/${order.id}`,
  })
}

export async function sendOrderConfirmedEmail(userId: string, order: any) {
  return sendWorkflowEmail(userId, "order-confirmed", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    total: order.total,
    link: `/dealer/orders/${order.id}`,
  })
}

export async function sendOrderShippedEmail(userId: string, order: any) {
  return sendWorkflowEmail(userId, "order-shipped", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    tracking: order.tracking_number,
    link: `/dealer/orders/${order.id}`,
  })
}

export async function sendOrderDeliveredEmail(userId: string, order: any) {
  return sendWorkflowEmail(userId, "order-delivered", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    link: `/dealer/orders/${order.id}`,
  })
}

export async function sendInvoiceGeneratedEmail(userId: string, invoice: any, order: any) {
  return sendWorkflowEmail(userId, "invoice-generated", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    invoiceNumber: invoice.invoice_number,
    total: invoice.total,
    link: `/api/invoices/${invoice.id}/pdf`,
  })
}

export async function sendPaymentSuccessEmail(userId: string, payment: any, order: any) {
  return sendWorkflowEmail(userId, "payment-success", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    amount: payment.amount,
    transactionId: payment.transaction_id,
    link: `/dealer/payments`,
  })
}

export async function sendPaymentFailedEmail(userId: string, payment: any, order: any, reason?: string) {
  return sendWorkflowEmail(userId, "payment-failed", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    amount: payment.amount,
    reason,
    link: `/dealer/orders`,
  })
}

export async function sendRefundCompletedEmail(userId: string, payment: any, order: any) {
  return sendWorkflowEmail(userId, "refund-completed", {
    name: order.buyer_name,
    orderNumber: order.order_number,
    amount: payment.amount,
  })
}

export async function sendEnquiryAssignedEmail(userId: string, enquiry: any) {
  return sendWorkflowEmail(userId, "enquiry-assigned", {
    name: enquiry.dealer_name,
    title: enquiry.title || enquiry.subject,
    link: `/dealer/enquiries/${enquiry.id}`,
  })
}

export async function sendQuotationSentEmail(userId: string, enquiry: any) {
  return sendWorkflowEmail(userId, "quotation-sent", {
    name: enquiry.customer_name,
    title: enquiry.title || enquiry.subject,
    link: `/dealer/enquiries/${enquiry.id}`,
  })
}

export async function sendInventoryLowEmail(userId: string, inventory: any, product: any) {
  return sendWorkflowEmail(userId, "inventory-low", {
    name: product.title,
    product: product.title,
    productName: product.title,
    availableStock: inventory.available_stock,
    link: `/admin/inventory`,
  })
}

export async function sendNotificationEmail(userId: string, payload: { subject: string; message: string; link?: string | null }) {
  const profile = await userEmail(userId)
  if (!profile?.email) return { success: false, error: "No email" }
  return sendEmail({
    to: profile.email,
    template: "notification",
    data: { subject: payload.subject, message: payload.message, link: payload.link },
    subject: payload.subject,
  })
}
