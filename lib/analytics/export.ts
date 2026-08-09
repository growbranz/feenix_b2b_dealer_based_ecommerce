"use server"

import { getReportData } from "./actions"
import * as PDFDocumentModule from "pdfkit"

const PDFDocument = (PDFDocumentModule as any).default || PDFDocumentModule

function escapeCSV(value: any) {
  const str = String(value ?? "")
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function generateCSV(rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map((c) => escapeCSV(c.label)).join(",")
  const lines = rows.map((row) =>
    columns.map((c) => escapeCSV(row[c.key])).join(",")
  )
  return [header, ...lines].join("\n")
}

export async function generatePDF(title: string, rows: any[], columns: { key: string; label: string }[]) {
  return new Promise<string>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 })
      const chunks: Buffer[] = []

      doc.on("data", (chunk: Buffer) => chunks.push(chunk))
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks)
        resolve(buffer.toString("base64"))
      })
      doc.on("error", (err: any) => reject(err))

      doc.font("Helvetica-Bold").fontSize(18).text(title, 40, 40)
      doc.moveDown(2)

      const colWidth = columns.length > 0 ? 520 / columns.length : 520
      let y = doc.y
      let x = 40

      doc.font("Helvetica-Bold").fontSize(9)
      for (const col of columns) {
        doc.text(col.label, x, y, { width: colWidth, align: "left" })
        x += colWidth + 10
      }
      y += 15
      doc.moveTo(40, y - 5).lineTo(560, y - 5).stroke("#E5E7EB")

      doc.font("Helvetica").fontSize(8)
      for (const row of rows) {
        x = 40
        for (const col of columns) {
          doc.text(String(row[col.key] ?? ""), x, y, { width: colWidth, align: "left" })
          x += colWidth + 10
        }
        y += 14
        if (y > 720) {
          doc.addPage()
          y = 40
        }
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

const reportColumns: Record<string, { key: string; label: string }[]> = {
  revenue: [
    { key: "id", label: "ID" },
    { key: "order_id", label: "Order ID" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ],
  orders: [
    { key: "id", label: "ID" },
    { key: "order_number", label: "Order Number" },
    { key: "buyer_id", label: "Buyer" },
    { key: "seller_id", label: "Seller" },
    { key: "total", label: "Total" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ],
  payments: [
    { key: "id", label: "ID" },
    { key: "order_id", label: "Order ID" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ],
  inventory: [
    { key: "product_title", label: "Product" },
    { key: "available_stock", label: "Available" },
    { key: "reserved_stock", label: "Reserved" },
    { key: "low_stock_limit", label: "Low Limit" },
    { key: "critical_stock_limit", label: "Critical" },
  ],
  dealers: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "is_active", label: "Active" },
    { key: "created_at", label: "Created" },
  ],
  customers: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "is_active", label: "Active" },
    { key: "created_at", label: "Created" },
  ],
  products: [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "price", label: "Price" },
    { key: "category_id", label: "Category" },
    { key: "brand_id", label: "Brand" },
    { key: "created_at", label: "Created" },
  ],
  refunds: [
    { key: "id", label: "ID" },
    { key: "order_id", label: "Order ID" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ],
}

function normalizeRows(type: string, rows: any[]) {
  if (type === "inventory") {
    return rows.map((r) => ({
      product_title: r.product?.title || r.product_title || r.product_id,
      available_stock: r.available_stock,
      reserved_stock: r.reserved_stock,
      low_stock_limit: r.low_stock_limit,
      critical_stock_limit: r.critical_stock_limit,
    }))
  }
  return rows
}

export async function exportReportCSV(type: string, filters: any = {}) {
  const { rows } = await getReportData(type, filters)
  const columns = reportColumns[type]
  if (!columns) throw new Error("Unsupported report type")
  const normalized = normalizeRows(type, rows)
  const csv = await generateCSV(normalized, columns)
  return { csv, filename: `${type}-report.csv` }
}

export async function exportReportPDF(type: string, filters: any = {}) {
  const { rows } = await getReportData(type, filters)
  const columns = reportColumns[type]
  if (!columns) throw new Error("Unsupported report type")
  const normalized = normalizeRows(type, rows)
  const title = `${type.replace(/-/g, " ").toUpperCase()} REPORT`
  const base64 = await generatePDF(title, normalized, columns)
  return { base64, filename: `${type}-report.pdf` }
}
