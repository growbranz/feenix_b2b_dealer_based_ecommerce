"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { Enquiry, EnquiryStatus, priorityOptions, statusOptions, dealerOptions, dealerName } from "@/lib/enquiry/data"
import { dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { ArrowUpDown, Eye, Users, XCircle } from "lucide-react"

const PAGE_SIZE = 5

type SortKey = "customer_name" | "created_at" | "priority"
type SortDir = "asc" | "desc"

interface EnquiryDataTableProps {
  enquiries: Enquiry[]
  onAssign: (enquiry: Enquiry) => void
  onCancel: (id: string) => void
  statusStyles: Record<EnquiryStatus, string>
}

const priorityBadge: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-rose-100 text-rose-700",
}

export function EnquiryDataTable({ enquiries, onAssign, onCancel, statusStyles }: EnquiryDataTableProps) {
  const [search, setSearch] = React.useState("")
  const [priorityFilter, setPriorityFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dealerFilter, setDealerFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [brandFilter, setBrandFilter] = React.useState("all")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({ key: "created_at", dir: "desc" })
  const [page, setPage] = React.useState(1)

  const categories = React.useMemo(() => [...new Set(enquiries.map((e) => e.category_name))], [enquiries])
  const brands = React.useMemo(() => [...new Set(enquiries.map((e) => e.brand_name))], [enquiries])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let data = enquiries.filter((e) => {
      const matchesSearch =
        !q ||
        e.id.toLowerCase().includes(q) ||
        e.customer_name.toLowerCase().includes(q) ||
        e.product_name.toLowerCase().includes(q)
      const matchesPriority = priorityFilter === "all" || e.priority === priorityFilter
      const matchesStatus = statusFilter === "all" || e.status === statusFilter
      const matchesDealer = dealerFilter === "all" || e.assigned_dealer_ids.includes(dealerFilter)
      const matchesCategory = categoryFilter === "all" || e.category_name === categoryFilter
      const matchesBrand = brandFilter === "all" || e.brand_name === brandFilter
      return matchesSearch && matchesPriority && matchesStatus && matchesDealer && matchesCategory && matchesBrand
    })

    data = data.sort((a, b) => {
      let aVal: string | number = ""
      let bVal: string | number = ""
      if (sort.key === "customer_name") {
        aVal = a.customer_name
        bVal = b.customer_name
      } else if (sort.key === "priority") {
        const p = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }
        aVal = p[a.priority]
        bVal = p[b.priority]
      } else if (sort.key === "created_at") {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      }
      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1
      return 0
    })

    return data
  }, [enquiries, search, priorityFilter, statusFilter, dealerFilter, categoryFilter, brandFilter, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput placeholder="Search enquiries..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} options={priorityOptions} className="lg:w-44" />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} className="lg:w-44" />
        <FilterSelect value={dealerFilter} onChange={(e) => setDealerFilter(e.target.value)} options={[{ value: "all", label: "All Dealers" }, ...dealerOptions.map((d) => ({ value: d.id, label: d.name }))]} className="lg:w-48" />
        <FilterSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={[{ value: "all", label: "All Categories" }, ...categories.map((c) => ({ value: c, label: c }))]} className="lg:w-44" />
        <FilterSelect value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} options={[{ value: "all", label: "All Brands" }, ...brands.map((b) => ({ value: b, label: b }))]} className="lg:w-44" />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort("customer_name")}>
                <span className="flex items-center gap-1">Customer <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Brand/Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned</th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort("created_at")}>
                <span className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{e.id}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{e.customer_name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{e.product_name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{e.brand_name} / {e.category_name}</td>
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs capitalize", priorityBadge[e.priority])}>{e.priority.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs capitalize", statusStyles[e.status])}>{e.status.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {e.assigned_dealer_ids.length > 0 ? e.assigned_dealer_ids.map(dealerName).join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{dateFormatter(e.created_at, "short")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/enquiries/${e.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-violet-600" onClick={() => onAssign(e)}>
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-600" onClick={() => onCancel(e.id)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
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
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
              ←
            </Button>
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {pageCount}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="h-8 w-8 p-0">
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
