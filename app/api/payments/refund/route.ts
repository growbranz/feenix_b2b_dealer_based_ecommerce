import { NextRequest, NextResponse } from "next/server"
import { processRefund } from "@/lib/payment/service"
import { requireAdmin } from "@/lib/auth/auth.helpers"

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAdmin()
    const body = await req.json()
    const { paymentId, amount, reason } = body

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId is required" }, { status: 400 })
    }

    const result = await processRefund(paymentId, {
      amount: amount ? Number(amount) : undefined,
      reason,
      actorId: user.id,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[payments/refund]", error)
    return NextResponse.json({ error: error.message || "Refund failed" }, { status: 500 })
  }
}
