"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { Order, OrderStatus, PaymentStatus, orderStatusOptions, dealerOptions } from "@/lib/orders/data"
import { dateFormatter } from "@/lib/utils"
import { ArrowUpDown, Eye, Users, Ban, RotateCcw } from "lucide-react"

const PAGE_SIZE = 5
type SortKey = "customer" | "created_at" | "grand_total"
type SortDir = "asc" | "desc"

interface OrderDataTableProps {
  orders: Order[]
  onStatus: (id: string, status: OrderStatus) => void
  onAssign: (order: Order) => void
  onCancel: (id: string) => void
  onRefund: (id: string) => void
  paymentColor: (status: PaymentStatus) => string
}

export function OrderDataTable({ orders, onStatus, onAssign, onCancel, onRefund, paymentColor }: OrderDataTableProps) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dealerFilter, setDealerFilter] = React.useState("all")
  const [paymentFilter, setPaymentFilter] = React.useState("all")
  const [cityFilter, setCityFilter] = React.useState("all")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({ key: "created_at", dir: "desc" })
  const [page, setPage] = React.useState(1)

  const cities = React.useMemo(() => [...new Set(orders.map((o) => o.customer.city))], [orders])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const data = orders.filter((o) => {
      const matchesSearch = !q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || o.status === statusFilter
      const matchesDealer = dealerFilter === "all" || o.dealer.id === dealerFilter
      const matchesPayment = paymentFilter === "all" || o.payment_status === paymentFilter
      const matchesCity = cityFilter === "all" || o.customer.city === cityFilter
      return matchesSearch && matchesStatus && matchesDealer && matchesPayment && matchesCity
    })

    data.sort((a, b) => {
      let aVal: string | number = ""
      let bVal: string | number = ""
      if (sort.key === "customer") { aVal = a.customer.name; bVal = b.customer.name }
      else if (sort.key === "grand_total") { aVal = a.grand_total; bVal = b.grand_total }
      else if (sort.key === "created_at") { aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime() }
      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1
      return 0
    })

    return data
  }, [orders, search, statusFilter, dealerFilter, paymentFilter, cityFilter, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))
    setPage(1)
  }

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={orderStatusOptions} className="lg:w-44" />
        <FilterSelect value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} options={[{ value: "all", label: "All Payments" }, { value: "PENDING", label: "Pending" }, { value: "COMPLETED", label: "Completed" }, { value: "REFUNDED", label: "Refunded" }]} className="lg:w-44" />
        <FilterSelect value={dealerFilter} onChange={(e) => setDealerFilter(e.target.value)} options={[{ value: "all", label: "All Dealers" }, ...dealerOptions.map((d) => ({ value: d.id, label: d.name }))]} className="lg:w-48" />
        <FilterSelect value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} options={[{ value: "all", label: "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))]} className="lg:w-44" />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">ID</th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort("customer")}><span className="flex items-center gap-1">Customer <ArrowUpDown className="h-3 w-3" /></span></th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dealer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">City</th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort("grand_total")}><span className="flex items-center gap-1">Total <ArrowUpDown className="h-3 w-3" /></span></th>
              <th className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500" onClick={() => toggleSort("created_at")}><span className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></span></th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{o.id}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{o.customer.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{o.dealer.name}</td>
                <td className="px-4 py-3">
                  <FilterSelect value={o.status} onChange={(e) => onStatus(o.id, e.target.value as OrderStatus)} options={orderStatusOptions.filter((s) => s.value !== "all")} className="h-8" />
                </td>
                <td className="px-4 py-3"><Badge className={`text-xs capitalize ${paymentColor(o.payment_status)}`}>{o.payment_status.toLowerCase()}</Badge></td>
                <td className="px-4 py-3 text-sm text-slate-600">{o.customer.city}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{formatCurrency(o.grand_total)}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{dateFormatter(o.created_at, "short")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/orders/${o.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-violet-600" onClick={() => onAssign(o)}><Users className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-600" onClick={() => onCancel(o.id)}><Ban className="h-4 w-4" /></Button>
                    {o.payment_status === "COMPLETED" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-orange-600" onClick={() => onRefund(o.id)}><RotateCcw className="h-4 w-4" /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} orders</p>
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
