"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { mockEnquiries, EnquiryStatus, statusOptions } from "@/lib/enquiry/data"
import { dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"

const CURRENT_DEALER_ID = "2"
const PAGE_SIZE = 5

const statusStyles: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  QUOTED: "bg-amber-100 text-amber-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-slate-100 text-slate-700",
}

const priorityBadge: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-rose-100 text-rose-700",
}

export function DealerEnquiryList() {
  const enquiries = React.useMemo(() => mockEnquiries.filter((e) => e.assigned_dealer_ids.includes(CURRENT_DEALER_ID)), [])
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const data = enquiries.filter((e) => {
      const matchesSearch = !q || e.id.toLowerCase().includes(q) || e.product_name.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || e.status === statusFilter
      return matchesSearch && matchesStatus
    })
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [enquiries, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Enquiries</h1>
        <p className="mt-1 text-sm text-slate-500">Enquiries assigned to you by the admin.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput placeholder="Search enquiries..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} className="md:w-48" />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{e.id}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{e.product_name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{e.customer_name}</td>
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs capitalize", priorityBadge[e.priority])}>{e.priority.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs capitalize", statusStyles[e.status])}>{e.status.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{dateFormatter(e.created_at, "short")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/dealer/enquiries/${e.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} enquiries</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">←</Button>
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {pageCount}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="h-8 w-8 p-0">→</Button>
          </div>
        </div>
      )}
    </div>
  )
}
