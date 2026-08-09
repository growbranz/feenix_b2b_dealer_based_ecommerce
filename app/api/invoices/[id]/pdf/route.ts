import { NextRequest } from "next/server"
import { generateInvoicePDF } from "@/lib/payment/invoice"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const buffer = await generateInvoicePDF(params.id)

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${params.id}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("[invoices/pdf]", error)
    return new Response(error.message || "Invoice generation failed", { status: 500 })
  }
}
