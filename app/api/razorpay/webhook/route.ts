import { NextRequest, NextResponse } from "next/server"
import { verifyWebhookSignature } from "@/lib/payment/utils"
import { capturePaymentFromWebhook } from "@/lib/payment/service"
import { supabaseAdmin } from "@/lib/supabase/admin"

const db = supabaseAdmin as any
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ""

async function getOrderIdFromRazorpayOrder(razorpayOrderId: string) {
  const { data } = await db
    .from("payments")
    .select("order_id")
    .eq("razorpay_order_id", razorpayOrderId)
    .limit(1)
    .single()
  return data?.order_id as string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature") || ""

    if (!RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    if (!verifyWebhookSignature(body, signature, RAZORPAY_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    const eventName = event.event

    if (eventName === "payment.captured" || eventName === "order.paid") {
      const entity = event.payload?.payment?.entity || {}
      const razorpayPaymentId = entity.id
      const razorpayOrderId = entity.order_id

      if (!razorpayPaymentId || !razorpayOrderId) {
        return NextResponse.json({ received: true })
      }

      const orderId = await getOrderIdFromRazorpayOrder(razorpayOrderId)
      if (orderId) {
        await capturePaymentFromWebhook(orderId, razorpayPaymentId, razorpayOrderId, null)
      }
    } else if (eventName === "payment.failed") {
      const entity = event.payload?.payment?.entity || {}
      const razorpayOrderId = entity.order_id
      if (razorpayOrderId) {
        const orderId = await getOrderIdFromRazorpayOrder(razorpayOrderId)
        if (orderId) {
          await db.from("payments").update({ status: "FAILED" }).eq("order_id", orderId)
          await db.from("orders").update({ payment_status: "FAILED" }).eq("id", orderId)
        }
      }
    } else if (eventName === "refund.created" || eventName === "refund.processed") {
      // Refund records are handled by the refund API; webhook is logged for audit.
      console.log("Razorpay refund webhook received", event.payload?.refund?.entity?.id)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[razorpay/webhook]", error)
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 })
  }
}
