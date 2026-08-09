import * as PDFDocumentModule from "pdfkit"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { formatCurrency } from "@/lib/payment/utils"

const PDFDocument = (PDFDocumentModule as any).default || PDFDocumentModule
const db = supabaseAdmin as any

export async function getInvoiceWithDetails(id: string) {
  const { data, error } = await db
    .from("invoices")
    .select(
      `*,
      customer:profiles!invoices_customer_id_fkey(id, name, email, phone, address, city, state, pincode, gst_number),
      dealer:profiles!invoices_dealer_id_fkey(id, name, business_name, email, phone, address, city, state, pincode, gst_number),
      product:products(id, title, sku, hsn, gst_rate),
      order:orders!inner(order_number)`
    )
    .eq("id", id)
    .single()
  if (error) throw error
  return data as any
}

function displayCurrency(amount: number, currency = "INR") {
  return formatCurrency(amount, currency).replace(/\u20B9/g, "Rs.").replace("₹", "Rs.")
}

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const invoice = await getInvoiceWithDetails(invoiceId)

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Buffer[] = []

      doc.on("data", (chunk: Buffer) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err: any) => reject(err))

      doc.font("Helvetica-Bold").fontSize(26).text("INVOICE", 50, 50)
      doc.font("Helvetica").fontSize(12).text(invoice.invoice_number, 400, 50, { align: "right" })

      doc.font("Helvetica").fontSize(10)
      doc.text(`Order: ${invoice.order?.order_number || invoice.order_id}`, 50, 90)
      doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString("en-IN")}`, 400, 90, { align: "right" })

      doc.moveDown(2)

      const leftX = 50
      const rightX = 300
      let y = doc.y

      doc.font("Helvetica-Bold").text("Billed By", leftX, y)
      doc.font("Helvetica-Bold").text("Billed To", rightX, y)

      doc.font("Helvetica").fontSize(10)
      y = doc.y

      const dealerAddress = [
        invoice.dealer?.business_name || invoice.dealer?.name || "Dealer",
        invoice.dealer?.email || "",
        invoice.dealer?.phone || "",
        invoice.dealer?.address || "",
        [invoice.dealer?.city, invoice.dealer?.state, invoice.dealer?.pincode]
          .filter(Boolean)
          .join(", ") || "",
        invoice.dealer?.gst_number ? `GSTIN: ${invoice.dealer.gst_number}` : "",
      ]
        .filter(Boolean)
        .join("\n")

      const customerAddress = [
        invoice.customer?.name || "Customer",
        invoice.customer?.email || "",
        invoice.customer?.phone || "",
        invoice.customer?.address || "",
        [invoice.customer?.city, invoice.customer?.state, invoice.customer?.pincode]
          .filter(Boolean)
          .join(", ") || "",
        invoice.customer?.gst_number ? `GSTIN: ${invoice.customer.gst_number}` : "",
      ]
        .filter(Boolean)
        .join("\n")

      doc.text(dealerAddress, leftX, y + 15)
      doc.text(customerAddress, rightX, y + 15)

      doc.moveDown(4)

      const tableTop = doc.y + 20
      const colX = [50, 220, 290, 360, 460]

      doc.font("Helvetica-Bold").fontSize(10)
      doc.text("Item", colX[0], tableTop)
      doc.text("Qty", colX[1], tableTop, { align: "center" })
      doc.text("Price", colX[2], tableTop, { align: "right" })
      doc.text("GST", colX[3], tableTop, { align: "right" })
      doc.text("Total", colX[4], tableTop, { align: "right" })

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke("#E5E7EB")

      let rowY = tableTop + 25
      doc.font("Helvetica").fontSize(10)

      const items = Array.isArray(invoice.line_items) ? invoice.line_items : [invoice]
      for (const item of items) {
        const qty = item.quantity || invoice.quantity || 1
        const price = item.price || invoice.price || 0
        const gstRate = item.gst_rate || invoice.gst_rate || 0
        const subtotal = price * qty
        const gst = (subtotal * gstRate) / 100
        const total = subtotal + gst

        doc.text(item.title || invoice.title || "Product", colX[0], rowY, { width: 160 })
        doc.text(String(qty), colX[1], rowY, { align: "center" })
        doc.text(displayCurrency(price, invoice.currency), colX[2], rowY, { align: "right" })
        doc.text(`${gstRate}%`, colX[3], rowY, { align: "right" })
        doc.text(displayCurrency(total, invoice.currency), colX[4], rowY, { align: "right" })

        rowY += 25
      }

      doc
        .moveTo(50, rowY + 5)
        .lineTo(550, rowY + 5)
        .stroke("#E5E7EB")

      const totalsX = 360
      const totalsY = rowY + 20

      doc.font("Helvetica").fontSize(10)
      doc.text("Subtotal:", totalsX, totalsY, { align: "left" })
      doc.text(displayCurrency(invoice.subtotal, invoice.currency), 460, totalsY, { align: "right" })

      doc.text("GST:", totalsX, totalsY + 20, { align: "left" })
      doc.text(displayCurrency(invoice.gst_amount, invoice.currency), 460, totalsY + 20, { align: "right" })

      if (invoice.discount) {
        doc.text("Discount:", totalsX, totalsY + 40, { align: "left" })
        doc.text(`-${displayCurrency(invoice.discount, invoice.currency)}`, 460, totalsY + 40, { align: "right" })
      }

      if (invoice.shipping) {
        const offset = invoice.discount ? 60 : 40
        doc.text("Shipping:", totalsX, totalsY + offset, { align: "left" })
        doc.text(displayCurrency(invoice.shipping, invoice.currency), 460, totalsY + offset, { align: "right" })
      }

      doc
        .moveTo(350, totalsY + (invoice.discount ? 80 : 60) + (invoice.shipping ? 20 : 0))
        .lineTo(550, totalsY + (invoice.discount ? 80 : 60) + (invoice.shipping ? 20 : 0))
        .stroke("#111827")

      const grandTotalY = totalsY + (invoice.discount ? 90 : 70) + (invoice.shipping ? 20 : 0)
      doc.font("Helvetica-Bold").fontSize(12)
      doc.text("Grand Total:", totalsX, grandTotalY, { align: "left" })
      doc.text(displayCurrency(invoice.total, invoice.currency), 460, grandTotalY, { align: "right" })

      doc.font("Helvetica").fontSize(10).fillColor("#6B7280")
      doc.text("Thank you for your business.", 50, doc.page.height - 100, { align: "center" })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
