import { getRazorpay } from "@/lib/razorpay/client"
import { supabaseAdmin } from "@/lib/supabase/admin"
import {
  verifyRazorpaySignature,
  toPaisa,
  fromPaisa,
  generateInvoiceNumber,
} from "@/lib/payment/utils"
import {
  reserveOrderStock,
  deductOrderStock,
  refundOrderStock,
  releaseOrderStock,
} from "@/lib/inventory/inventory-sync"
import { notifyOnPaymentSuccess, notifyOnRefundCompleted } from "@/lib/notifications/notifier"
import { revalidatePath } from "next/cache"
import type { Order, Payment } from "@/types"
import type { PaymentFilterOptions, PaymentStats, DealerPaymentStats } from "@/types/payment"

const db = supabaseAdmin as any

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || ""

export async function getOrderWithDetails(orderId: string) {
  const { data, error } = await db
    .from("orders")
    .select(
      `*,
      buyer:profiles!orders_buyer_id_fkey(id, name, email, phone),
      seller:profiles!orders_seller_id_fkey(id, name, business_name, email, phone),
      product:products(id, title, sku, hsn, gst_rate)`
    )
    .eq("id", orderId)
    .single()
  if (error) throw error
  return data as any
}

export async function getPaymentWithDetails(paymentId: string) {
  const { data, error } = await db
    .from("payments")
    .select(
      `*,
      order:orders!inner(order_number, buyer:profiles!orders_buyer_id_fkey(name, email), seller:profiles!orders_seller_id_fkey(name, business_name), product:products(title, sku)),
      invoice:invoices(invoice_number)`
    )
    .eq("id", paymentId)
    .single()
  if (error) throw error
  return data as any
}

export async function createPaymentOrder(
  orderId: string,
  options: { shipping?: number; discount?: number; notes?: string; actorId?: string | null } = {}
) {
  const order = await getOrderWithDetails(orderId)
  if (!order) throw new Error("Order not found")

  const shipping = options.shipping || 0
  const discount = options.discount || 0
  const amount = Math.max(0, Number(order.total) + shipping - discount)

  const razorpayOrder = await getRazorpay().orders.create({
    amount: toPaisa(amount),
    currency: "INR",
    receipt: order.order_number,
    notes: {
      order_id: order.id,
      order_number: order.order_number,
    },
  })

  const { data: payment, error: insertError } = await db
    .from("payments")
    .insert({
      order_id: order.id,
      dealer_id: order.seller_id,
      customer_id: order.buyer_id,
      razorpay_order_id: razorpayOrder.id,
      amount,
      gst: order.tax || 0,
      discount,
      shipping,
      currency: razorpayOrder.currency || "INR",
      status: "CREATED",
      notes: options.notes || null,
    })
    .select()
    .single()

  if (insertError) throw insertError

  await createAuditLog(payment.id, order.id, "PAYMENT_ORDER_CREATED", options.actorId || null, {
    razorpay_order_id: razorpayOrder.id,
    amount,
  })

  return {
    razorpay_order_id: razorpayOrder.id,
    amount: toPaisa(amount),
    currency: razorpayOrder.currency || "INR",
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    order,
    payment,
    description: `Payment for order ${order.order_number}`,
    prefill: {
      name: order.buyer?.name || "",
      email: order.buyer?.email || "",
      contact: order.buyer?.phone || "",
    },
  }
}

export async function verifyAndCapturePayment(
  orderId: string,
  razorpayPaymentId: string,
  signature: string,
  actorId: string | null
) {
  const order = await getOrderWithDetails(orderId)
  const { data: payment, error: paymentError } = await db
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("razorpay_order_id", order.razorpay_order_id || null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (paymentError || !payment) throw new Error("Payment record not found")

  if (payment.status === "CAPTURED") {
    return { success: true, payment }
  }

  if (!verifyRazorpaySignature(payment.razorpay_order_id, razorpayPaymentId, signature, RAZORPAY_SECRET)) {
    await updatePaymentStatus(payment.id, "FAILED", { razorpay_payment_id: razorpayPaymentId })
    throw new Error("Invalid Razorpay signature")
  }

  const razorpayPayment = await getRazorpay().payments.fetch(razorpayPaymentId)

  if (razorpayPayment.status !== "captured") {
    await updatePaymentStatus(payment.id, "FAILED", {
      razorpay_payment_id: razorpayPaymentId,
      notes: `Razorpay status: ${razorpayPayment.status}`,
    })
    throw new Error(`Payment not captured: ${razorpayPayment.status}`)
  }

  const captured = await capturePaymentRecord(payment, razorpayPayment, order, actorId)
  return { success: true, payment: captured }
}

export async function capturePaymentFromWebhook(
  orderId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  actorId: string | null
) {
  const { data: payment } = await db
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .eq("razorpay_order_id", razorpayOrderId)
    .single()

  if (!payment) {
    const order = await getOrderWithDetails(orderId)
    const { data: newPayment } = await db
      .from("payments")
      .insert({
        order_id: order.id,
        dealer_id: order.seller_id,
        customer_id: order.buyer_id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount: order.total,
        gst: order.tax || 0,
        currency: "INR",
        status: "PENDING",
      })
      .select()
      .single()
    if (newPayment) {
      return capturePaymentRecord(newPayment, { status: "captured", method: "unknown" }, order, actorId)
    }
    throw new Error("Payment record not found and could not be created")
  }

  if (payment.status === "CAPTURED") return { success: true, payment }

  const order = await getOrderWithDetails(orderId)
  const razorpayPayment = await getRazorpay().payments.fetch(razorpayPaymentId)
  const captured = await capturePaymentRecord(payment, razorpayPayment, order, actorId)
  return { success: true, payment: captured }
}

async function capturePaymentRecord(payment: Payment, razorpayPayment: any, order: any, actorId: string | null) {
  const updates: any = {
    status: "CAPTURED",
    razorpay_payment_id: razorpayPayment.id || payment.razorpay_payment_id,
    payment_method: razorpayPayment.method || null,
    paid_at: new Date().toISOString(),
  }

  const { data: updatedPayment, error: updateError } = await db
    .from("payments")
    .update(updates)
    .eq("id", payment.id)
    .select()
    .single()
  if (updateError) throw updateError

  const { error: orderError } = await db
    .from("orders")
    .update({ payment_status: "PAID", status: "CONFIRMED" })
    .eq("id", payment.order_id)
  if (orderError) throw orderError

  const invoice = await createInvoice(order, updatedPayment)

  await db.from("payments").update({ invoice_id: invoice.id }).eq("id", payment.id)

  try {
    await deductOrderStock(order.id, actorId)
  } catch (e: any) {
    console.warn("Inventory deduction warning:", e.message)
  }

  await notifyOnPaymentSuccess(updatedPayment, order, actorId)

  await createAuditLog(payment.id, payment.order_id, "PAYMENT_CAPTURED", actorId, {
    razorpay_payment_id: razorpayPayment.id,
    amount: payment.amount,
    invoice_id: invoice.id,
  })

  revalidatePath("/admin/payments")
  revalidatePath("/dealer/payments")
  return { ...updatedPayment, invoice_id: invoice.id }
}

async function updatePaymentStatus(paymentId: string, status: string, extras: any = {}) {
  const { error } = await db
    .from("payments")
    .update({ status, ...extras })
    .eq("id", paymentId)
  if (error) throw error
}

export async function createInvoice(order: any, payment: any) {
  const subtotal = Number(order.subtotal || 0)
  const gst = Number(order.tax || 0)
  const shipping = Number(payment.shipping || 0)
  const discount = Number(payment.discount || 0)
  const total = Math.max(0, subtotal + gst + shipping - discount)

  const lineItems = [
    {
      title: order.product?.title || "Product",
      sku: order.product?.sku || null,
      hsn: order.product?.hsn || null,
      quantity: order.quantity,
      price: order.price,
      gst_rate: order.product?.gst_rate || 0,
    },
  ]

  const { data: invoice, error } = await db
    .from("invoices")
    .insert({
      invoice_number: generateInvoiceNumber(),
      order_id: order.id,
      payment_id: payment.id,
      dealer_id: order.seller_id,
      customer_id: order.buyer_id,
      product_id: order.product_id,
      title: order.product?.title || null,
      quantity: order.quantity,
      price: order.price,
      hsn: order.product?.hsn || null,
      gst_rate: order.product?.gst_rate || 0,
      gst_amount: gst,
      discount,
      shipping,
      subtotal,
      total,
      line_items: lineItems,
      status: "ISSUED",
    })
    .select()
    .single()

  if (error) throw error
  return invoice as any
}

async function createAuditLog(
  paymentId: string,
  orderId: string,
  action: string,
  actorId: string | null,
  metadata: any = {}
) {
  await db.from("payment_audit_logs").insert({
    payment_id: paymentId,
    order_id: orderId,
    action,
    actor_id: actorId,
    metadata,
  })
}

export async function processRefund(
  paymentId: string,
  options: { amount?: number; reason?: string; actorId?: string | null } = {}
) {
  const payment = await getPaymentWithDetails(paymentId)
  if (!payment) throw new Error("Payment not found")
  if (payment.status !== "CAPTURED") throw new Error("Only captured payments can be refunded")

  const refundAmount = options.amount || Number(payment.amount)
  const isFullRefund = refundAmount >= Number(payment.amount)

  const refund = await getRazorpay().payments.refund(payment.razorpay_payment_id, {
    amount: toPaisa(refundAmount),
    notes: {
      reason: options.reason || "Refund",
      payment_id: payment.id,
    },
  })

  const status = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED"
  const orderStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED"

  await db.from("payments").update({ status }).eq("id", payment.id)
  await db
    .from("orders")
    .update({ payment_status: orderStatus, status: isFullRefund ? "CANCELLED" : undefined })
    .eq("id", payment.order_id)

  if (isFullRefund) {
    try {
      await refundOrderStock(payment.order_id, options.actorId || null)
    } catch (e: any) {
      console.warn("Inventory refund warning:", e.message)
    }
  }

  await notifyOnRefundCompleted(payment, payment.order, refundAmount, options.actorId || null)

  await createAuditLog(payment.id, payment.order_id, "PAYMENT_REFUNDED", options.actorId || null, {
    refund_id: refund.id,
    amount: refundAmount,
    reason: options.reason,
  })

  revalidatePath("/admin/payments")
  return { success: true, refund }
}

export async function getPayments(options: PaymentFilterOptions = {}) {
  const {
    search,
    dealerId,
    customerId,
    status,
    method,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = options

  let query = db
    .from("payments")
    .select(
      `*,
      order:orders!inner(order_number, buyer:profiles!orders_buyer_id_fkey(name, email), seller:profiles!orders_seller_id_fkey(name, business_name), product:products(title, sku)),
      invoice:invoices(invoice_number)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (dealerId) query = query.eq("dealer_id", dealerId)
  if (customerId) query = query.eq("customer_id", customerId)
  if (status) query = query.eq("status", status)
  if (method) query = query.eq("payment_method", method)
  if (startDate) query = query.gte("created_at", startDate)
  if (endDate) query = query.lte("created_at", `${endDate}T23:59:59.999Z`)

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw error

  let rows = (data || []) as any[]
  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    rows = rows.filter(
      (p: any) =>
        p.order?.order_number?.toLowerCase().includes(q) ||
        p.order?.buyer?.name?.toLowerCase().includes(q) ||
        p.order?.seller?.business_name?.toLowerCase().includes(q) ||
        p.razorpay_order_id?.toLowerCase().includes(q) ||
        p.razorpay_payment_id?.toLowerCase().includes(q)
    )
  }

  return {
    data: rows,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1,
  }
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const { data, error } = await db.from("payments").select("*")
  if (error) throw error

  const rows = (data || []) as any[]
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const monthStart = `${today.slice(0, 7)}-01`

  let revenue = 0
  let todayRevenue = 0
  let monthlyRevenue = 0
  let pending = 0
  let successful = 0
  let failed = 0
  let refunds = 0

  for (const p of rows) {
    const amt = Number(p.amount || 0)
    const isCaptured = p.status === "CAPTURED"
    const isRefund = p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED"

    if (isCaptured) {
      revenue += amt
      successful += 1
      if (p.created_at?.startsWith(today)) todayRevenue += amt
      if (p.created_at >= monthStart) monthlyRevenue += amt
    } else if (p.status === "PENDING" || p.status === "CREATED" || p.status === "AUTHORIZED") {
      pending += 1
    } else if (p.status === "FAILED" || p.status === "CANCELLED") {
      failed += 1
    }

    if (isRefund) refunds += 1
  }

  return {
    revenue,
    todayRevenue,
    monthlyRevenue,
    pending,
    successful,
    failed,
    refunds,
    count: rows.length,
  }
}

export async function getDealerPaymentStats(dealerId: string): Promise<DealerPaymentStats> {
  const { data, error } = await db.from("payments").select("*").eq("dealer_id", dealerId)
  if (error) throw error

  const rows = (data || []) as any[]
  let sales = 0
  let completed = 0
  let pendingSettlements = 0
  let refunds = 0

  for (const p of rows) {
    const amt = Number(p.amount || 0)
    if (p.status === "CAPTURED") {
      sales += amt
      completed += 1
    } else if (p.status === "PENDING" || p.status === "CREATED") {
      pendingSettlements += 1
    } else if (p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED") {
      refunds += 1
    }
  }

  return { sales, completed, pendingSettlements, refunds, count: rows.length }
}
