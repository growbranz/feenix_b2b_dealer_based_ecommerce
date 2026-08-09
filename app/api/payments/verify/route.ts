import { NextRequest, NextResponse } from "next/server"
import { verifyAndCapturePayment } from "@/lib/payment/service"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"

export async function POST(req: NextRequest) {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, razorpay_payment_id, razorpay_signature } = body

    if (!orderId || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "orderId, razorpay_payment_id and razorpay_signature are required" },
        { status: 400 }
      )
    }

    const result = await verifyAndCapturePayment(
      orderId,
      razorpay_payment_id,
      razorpay_signature,
      userProfile.user.id
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[payments/verify]", error)
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 })
  }
}
