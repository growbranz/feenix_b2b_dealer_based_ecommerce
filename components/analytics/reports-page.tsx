"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getReportData } from "@/lib/analytics/actions"
import { exportReportCSV, exportReportPDF } from "@/lib/analytics/export"
import { Download, FileText, FileSpreadsheet, Search } from "lucide-react"

const reportTypes = [
  { key: "revenue", label: "Revenue Report" },
  { key: "orders", label: "Orders Report" },
  { key: "payments", label: "Payments Report" },
  { key: "inventory", label: "Inventory Report" },
  { key: "dealers", label: "Dealer Report" },
  { key: "customers", label: "Customer Report" },
  { key: "products", label: "Product Report" },
  { key: "refunds", label: "Refund Report" },
]

export function ReportsPage() {
  const [reportType, setReportType] = React.useState("revenue")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [exporting, setExporting] = React.useState<"csv" | "pdf" | null>(null)

  async function load() {
    setLoading(true)
    try {
      const filters: any = {}
      if (from) filters.from = from
      if (to) filters.to = to
      const result = await getReportData(reportType, filters)
      setData(result)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  async function handleExport(format: "csv" | "pdf") {
    setExporting(format)
    try {
      const filters: any = {}
      if (from) filters.from = from
      if (to) filters.to = to
      if (format === "csv") {
        const { csv, filename } = await exportReportCSV(reportType, filters)
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const { base64, filename } = await exportReportPDF(reportType, filters)
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(null)
    }
  }

  const columns = data?.columns || []
  const rows = data?.rows || []

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Report</label>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={load} className="flex-1" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Load"}
            </Button>
            <Button variant="outline" onClick={() => handleExport("csv")} disabled={exporting !== null}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")} disabled={exporting !== null}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-slate-500">No data found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {columns.map((col: any, i: number) => (
                  <th key={i} className="px-4 py-3 font-medium text-slate-600">
                    {typeof col === "string" ? col : col.label || col.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((row: any, idx: number) => (
                <tr key={idx} className="border-t">
                  {columns.map((col: any, cIdx: number) => {
                    const key = typeof col === "string" ? col.toLowerCase() : col.key
                    return (
                      <td key={cIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {String(row[key] ?? "")}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
