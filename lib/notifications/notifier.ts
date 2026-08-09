import { supabaseAdmin } from "@/lib/supabase/admin"
import { createBulkNotifications, createNotification } from "./actions"
import type { NotificationInput, NotificationType, NotificationCategory } from "@/types/notifications"

const db = supabaseAdmin as any

async function getRecipientsWithRoles(userIds: string[]) {
  const { data, error } = await db.from("profiles").select("id, role").in("id", userIds)
  if (error) throw error
  const map: Record<string, string> = {}
  for (const p of data || []) map[p.id] = p.role
  return map
}

function pathFor(role: string, segment: string, id?: string) {
  const base = role === "ADMIN" ? `/admin/${segment}` : `/dealer/${segment}`
  return id ? `${base}/${id}` : base
}

async function notifyRecipients(
  userIds: string[],
  base: any,
  actorId?: string | null
) {
  const { segment, entityId, query, ...notificationBase } = base
  const roles = await getRecipientsWithRoles(userIds)
  const inputs: NotificationInput[] = userIds.map((id) => ({
    ...notificationBase,
    userId: id,
    link:
      segment && roles[id]
        ? `${pathFor(roles[id], segment, entityId)}${query || ""}`
        : base.link || null,
  }))
  return createBulkNotifications(inputs, actorId)
}

export async function notifyUser(
  userId: string,
  input: any,
  actorId?: string | null
) {
  const { segment, entityId, query, ...rest } = input
  return createNotification({ ...rest, userId }, actorId)
}

export async function notifyAdmins(
  input: any,
  actorId?: string | null
) {
  const { data } = await db.from("profiles").select("id").eq("role", "ADMIN")
  const ids = (data || []).map((p: any) => p.id)
  if (ids.length === 0) return []
  return notifyRecipients(ids, input, actorId)
}

export async function notifyByRole(
  role: "ADMIN" | "DEALER",
  input: any,
  actorId?: string | null
) {
  const { data } = await db.from("profiles").select("id").eq("role", role)
  const ids = (data || []).map((p: any) => p.id)
  if (ids.length === 0) return []
  return notifyRecipients(ids, input, actorId)
}

export async function notifyOnEnquiryCreated(enquiry: any, actorId?: string | null) {
  return notifyAdmins(
    {
      title: "New Enquiry Received",
      message: `A new enquiry #${enquiry.id?.slice(0, 8)} has been submitted.`,
      type: "information",
      category: "enquiry",
      source: "enquiry",
      sourceId: enquiry.id,
      segment: "enquiries",
      entityId: enquiry.id,
    },
    actorId
  )
}

export async function notifyOnDealerAssigned(dealerId: string, order: any, actorId?: string | null) {
  await notifyUser(
    dealerId,
    {
      title: "Order assigned to you",
      message: `Order ${order.order_number} has been assigned to you.`,
      type: "information",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
      sendEmail: true,
      emailSubject: "New order assigned",
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "Order dealer assigned",
      message: `Order ${order.order_number} was assigned to a dealer.`,
      type: "information",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
}

export async function notifyOnDealerAccepted(order: any, actorId?: string | null) {
  await notifyRecipients(
    [order.buyer_id],
    {
      title: "Order accepted",
      message: `Order ${order.order_number} has been accepted by the dealer.`,
      type: "success",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "Order accepted by dealer",
      message: `Order ${order.order_number} was accepted.`,
      type: "success",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
}

export async function notifyOnDealerRejected(order: any, actorId?: string | null) {
  await notifyRecipients(
    [order.buyer_id],
    {
      title: "Order rejected",
      message: `Order ${order.order_number} was rejected by the dealer.`,
      type: "warning",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "Order rejected",
      message: `Order ${order.order_number} was rejected by a dealer.`,
      type: "warning",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
}

export async function notifyOnOrderCreated(order: any, actorId?: string | null) {
  await notifyRecipients(
    [order.seller_id],
    {
      title: "New order received",
      message: `You have a new order ${order.order_number} for ₹${order.total}.`,
      type: "information",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "New order created",
      message: `Order ${order.order_number} was created.`,
      type: "information",
      category: "order",
      source: "order",
      sourceId: order.id,
      segment: "orders",
      entityId: order.id,
    },
    actorId
  )
}

export async function notifyOnPaymentSuccess(payment: any, order: any, actorId?: string | null) {
  const userIds = [order.buyer_id, order.seller_id]
  const linkQuery = `?search=${order.order_number}`
  await notifyRecipients(
    userIds,
    {
      title: "Payment successful",
      message: `Payment of ₹${payment.amount} for order ${order.order_number} has been received.`,
      type: "success",
      category: "payment",
      source: "payment",
      sourceId: payment.id,
      segment: "payments",
      query: linkQuery,
      sendEmail: true,
      emailSubject: "Payment received",
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "Payment successful",
      message: `Order ${order.order_number} payment of ₹${payment.amount} is successful.`,
      type: "success",
      category: "payment",
      source: "payment",
      sourceId: payment.id,
      segment: "payments",
      query: linkQuery,
    },
    actorId
  )
}

export async function notifyOnPaymentFailed(payment: any, order: any, actorId?: string | null) {
  await notifyRecipients(
    [order.buyer_id],
    {
      title: "Payment failed",
      message: `Payment for order ${order.order_number} failed. Please retry.`,
      type: "error",
      category: "payment",
      source: "payment",
      sourceId: payment.id,
      segment: "payments",
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "Payment failed",
      message: `Payment for order ${order.order_number} failed.`,
      type: "error",
      category: "payment",
      source: "payment",
      sourceId: payment.id,
      segment: "payments",
    },
    actorId
  )
}

export async function notifyOnRefundCompleted(payment: any, order: any, refundAmount: number, actorId?: string | null) {
  await notifyRecipients(
    [order.buyer_id, order.seller_id],
    {
      title: "Refund processed",
      message: `A refund of ₹${refundAmount} for order ${order.order_number} has been initiated.`,
      type: "warning",
      category: "payment",
      source: "payment",
      sourceId: payment.id,
      segment: "payments",
    },
    actorId
  )
  await notifyAdmins(
    {
      title: "Refund processed",
      message: `Refund of ₹${refundAmount} initiated for order ${order.order_number}.`,
      type: "warning",
      category: "payment",
      source: "payment",
      sourceId: payment.id,
      segment: "payments",
    },
    actorId
  )
}

export async function notifyOnInventoryLow(inventory: any, product: any, actorId?: string | null) {
  const userIds = inventory.dealer_id ? [inventory.dealer_id] : []
  if (userIds.length) {
    await notifyRecipients(
      userIds,
      {
        title: "Low stock alert",
        message: `Product "${product.title || product.id}" is running low (${inventory.available_stock} left).`,
        type: "warning",
        category: "inventory",
        source: "inventory",
        sourceId: inventory.id,
        segment: "inventory",
      },
      actorId
    )
  }
  await notifyAdmins(
    {
      title: "Low stock alert",
      message: `Product "${product.title || product.id}" has low stock.`,
      type: "warning",
      category: "inventory",
      source: "inventory",
      sourceId: inventory.id,
      segment: "inventory",
    },
    actorId
  )
}

export async function notifyOnOutOfStock(inventory: any, product: any, actorId?: string | null) {
  const userIds = inventory.dealer_id ? [inventory.dealer_id] : []
  if (userIds.length) {
    await notifyRecipients(
      userIds,
      {
        title: "Out of stock",
        message: `Product "${product.title || product.id}" is out of stock.`,
        type: "critical",
        category: "inventory",
        source: "inventory",
        sourceId: inventory.id,
        segment: "inventory",
      },
      actorId
    )
  }
  await notifyAdmins(
    {
      title: "Out of stock",
      message: `Product "${product.title || product.id}" is out of stock.`,
      type: "critical",
      category: "inventory",
      source: "inventory",
      sourceId: inventory.id,
      segment: "inventory",
    },
    actorId
  )
}

export async function notifyOnInvoiceGenerated(invoice: any, order: any, actorId?: string | null) {
  const link = `/api/invoices/${invoice.id}/pdf`
  await createBulkNotifications(
    [order.buyer_id, order.seller_id].map((id) => ({
      userId: id,
      title: "Invoice generated",
      message: `Invoice ${invoice.invoice_number} has been generated for order ${order.order_number}.`,
      type: "information",
      category: "invoice",
      source: "invoice",
      sourceId: invoice.id,
      link,
      sendEmail: true,
      emailSubject: `Invoice ${invoice.invoice_number}`,
    })),
    actorId
  )
  await notifyAdmins(
    {
      title: "Invoice generated",
      message: `Invoice ${invoice.invoice_number} has been generated.`,
      type: "information",
      category: "invoice",
      source: "invoice",
      sourceId: invoice.id,
      link,
    },
    actorId
  )
}

export async function notifyOnMessageReceived(conversationId: string, senderName: string, recipientId: string, preview: string, actorId?: string | null) {
  const roles = await getRecipientsWithRoles([recipientId])
  const role = roles[recipientId]
  const link = role ? `${pathFor(role, "messages")}?conversation=${conversationId}` : null
  return createNotification(
    {
      userId: recipientId,
      title: `New message from ${senderName}`,
      message: preview,
      type: "information",
      category: "message",
      source: "message",
      sourceId: conversationId,
      link,
    },
    actorId
  )
}

export async function notifyOnDealerApproved(dealerProfile: any, actorId?: string | null) {
  return notifyUser(
    dealerProfile.id,
    {
      title: "Account approved",
      message: "Your dealer account has been approved. You can now start selling.",
      type: "success",
      category: "dealer",
      source: "dealer",
      sourceId: dealerProfile.id,
      segment: "dashboard",
      sendEmail: true,
      emailSubject: "Your Feenix Repair account is approved",
    },
    actorId
  )
}

export async function notifyOnDealerApplicationRejected(dealerProfile: any, reason: string, actorId?: string | null) {
  return notifyUser(
    dealerProfile.id,
    {
      title: "Account not approved",
      message: `Your dealer account was not approved. ${reason || ""}`,
      type: "warning",
      category: "dealer",
      source: "dealer",
      sourceId: dealerProfile.id,
      segment: "profile",
    },
    actorId
  )
}

export async function notifyOnProductApproved(product: any, actorId?: string | null) {
  if (!product.dealer_id) return
  return notifyUser(
    product.dealer_id,
    {
      title: "Product approved",
      message: `Your product "${product.title}" has been approved and is now live.`,
      type: "success",
      category: "product",
      source: "product",
      sourceId: product.id,
      segment: "products",
      entityId: product.id,
    },
    actorId
  )
}
