"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdvancedReport, getAuditReport, getSavedFilters, saveFilter, scheduleReport } from "@/lib/reports/actions"
import { generateCSV, generatePDF } from "@/lib/analytics/export"
import { FileSpreadsheet, FileText, Printer, Save, Clock, Search } from "lucide-react"

const advancedTypes = [
  { key: "dealer-performance", label: "Dealer Performance" },
  { key: "customer-lifetime-value", label: "Customer Lifetime Value" },
  { key: "repeat-customers", label: "Repeat Customers" },
  { key: "sales-funnel", label: "Sales Funnel" },
  { key: "enquiry-conversion", label: "Enquiry Conversion" },
  { key: "order-completion", label: "Order Completion" },
  { key: "refund-analysis", label: "Refund Analysis" },
  { key: "payment-failure", label: "Payment Failure" },
  { key: "inventory-turnover", label: "Inventory Turnover" },
  { key: "product-performance", label: "Product Performance" },
  { key: "city-sales", label: "City-wise Sales" },
  { key: "state-sales", label: "State-wise Sales" },
  { key: "category-performance", label: "Category Performance" },
  { key: "brand-performance", label: "Brand Performance" },
]

const auditTypes = [
  { key: "admin-activities", label: "Admin Activities" },
  { key: "dealer-activities", label: "Dealer Activities" },
  { key: "login-history", label: "Login History" },
  { key: "order-history", label: "Order History" },
  { key: "payment-history", label: "Payment History" },
  { key: "inventory-changes", label: "Inventory Changes" },
]

export function ReportsExportPage() {
  const [category, setCategory] = React.useState<"advanced" | "audit">("advanced")
  const [reportType, setReportType] = React.useState("dealer-performance")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [exporting, setExporting] = React.useState<"csv" | "pdf" | null>(null)
  const [filterName, setFilterName] = React.useState("")

  async function load() {
    setLoading(true)
    try {
      const filters: any = {}
      if (from) filters.from = from
      if (to) filters.to = to
      const result =
        category === "advanced" ? await getAdvancedReport(reportType as any, filters) : await getAuditReport(reportType as any, filters)
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

  async function exportData(format: "csv" | "pdf") {
    if (!data) return
    setExporting(format)
    try {
      const title = `${reportType.replace(/-/g, " ").toUpperCase()} REPORT`
      if (format === "csv") {
        const csv = await generateCSV(data.rows, data.columns)
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportType}-report.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const base64 = await generatePDF(title, data.rows, data.columns)
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportType}-report.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(null)
    }
  }

  async function saveCurrentFilter() {
    if (!filterName) return
    await saveFilter(filterName, { from, to })
    setFilterName("")
    alert("Filter saved")
  }

  async function scheduleCurrent() {
    await scheduleReport(reportType, "monthly", [""])
    alert("Scheduled (requires scheduled_reports table)")
  }

  const reportOptions = category === "advanced" ? advancedTypes : auditTypes
  const currentLabel = reportOptions.find((r) => r.key === reportType)?.label || reportType

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <div className="mb-3 flex gap-2">
          {(["advanced", "audit"] as const).map((c) => (
            <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => { setCategory(c); setReportType((c === "advanced" ? advancedTypes : auditTypes)[0].key) }}>
              {c === "advanced" ? "Advanced" : "Audit"}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Report</label>
            <select
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportOptions.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
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
            <Button onClick={load} disabled={loading} className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Loading..." : "Load"}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <Input placeholder="Filter name" value={filterName} onChange={(e) => setFilterName(e.target.value)} className="w-48" />
          <Button variant="outline" size="sm" onClick={saveCurrentFilter}>
            <Save className="mr-2 h-4 w-4" />
            Save Filter
          </Button>
          <Button variant="outline" size="sm" onClick={scheduleCurrent}>
            <Clock className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData("csv")} disabled={exporting !== null}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportData("pdf")} disabled={exporting !== null}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : data?.rows?.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-slate-500">No data found for {currentLabel}.</div>
      ) : data ? (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {data.columns.map((col: any, i: number) => (
                  <th key={i} className="px-4 py-3 font-medium text-slate-600">{col.label || col.key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, 100).map((row: any, idx: number) => (
                <tr key={idx} className="border-t">
                  {data.columns.map((col: any, cIdx: number) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
