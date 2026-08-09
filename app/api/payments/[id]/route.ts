import { NextRequest, NextResponse } from "next/server"
import { getPaymentWithDetails } from "@/lib/payment/service"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payment = await getPaymentWithDetails(params.id)
    return NextResponse.json({ payment })
  } catch (error: any) {
    console.error("[payments/[id]]", error)
    return NextResponse.json({ error: error.message || "Payment not found" }, { status: 500 })
  }
}
