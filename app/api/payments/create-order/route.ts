import { NextRequest, NextResponse } from "next/server"
import { createPaymentOrder } from "@/lib/payment/service"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"

export async function POST(req: NextRequest) {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, shipping, discount, notes } = body
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    const data = await createPaymentOrder(orderId, {
      shipping: Number(shipping || 0),
      discount: Number(discount || 0),
      notes,
      actorId: userProfile.user.id,
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[payments/create-order]", error)
    return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 })
  }
}
