"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import type { AdminOrder } from "@/lib/admin/orders-service"
import { orderStatusOptions, statusColor, paymentColor } from "@/lib/orders/data"
import type { PaymentStatus } from "@/types/orders"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { ArrowUpDown, Eye, Users, Ban, RotateCcw } from "lucide-react"

const PAGE_SIZE = 5
type SortKey = "customer" | "created_at" | "grand_total"
type SortDir = "asc" | "desc"

interface OrderDataTableProps {
  orders: AdminOrder[]
  onStatus: (id: string, status: string) => void
  onAssign: (order: AdminOrder) => void
  onCancel: (id: string) => void
  onRefund: (id: string) => void
}

export function OrderDataTable({ orders, onStatus, onAssign, onCancel, onRefund }: OrderDataTableProps) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dealerFilter, setDealerFilter] = React.useState("all")
  const [paymentFilter, setPaymentFilter] = React.useState("all")
  const [cityFilter, setCityFilter] = React.useState("all")
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({ key: "created_at", dir: "desc" })
  const [page, setPage] = React.useState(1)

  const dealerOptions = React.useMemo(() => {
    const seen = new Set<string>()
    const options: { value: string; label: string }[] = []
    for (const o of orders) {
      if (!o.dealer?.id || seen.has(o.dealer.id)) continue
      seen.add(o.dealer.id)
      options.push({ value: o.dealer.id, label: o.dealer.business_name || o.dealer.name || "—" })
    }
    return [{ value: "all", label: "All Dealers" }, ...options.sort((a, b) => a.label.localeCompare(b.label))]
  }, [orders])

  const paymentOptions = React.useMemo(() => {
    const set = new Set<string>(orders.map((o) => o.payment_status))
    const statusLabels: Record<string, string> = { PENDING: "Pending", COMPLETED: "Completed", FAILED: "Failed", REFUNDED: "Refunded" }
    const values = [...set].sort()
    return [{ value: "all", label: "All Payments" }, ...values.map((s) => ({ value: s, label: statusLabels[s] || s }))]
  }, [orders])

  const cities = React.useMemo(() => {
    const set = new Set<string>()
    for (const o of orders) {
      if (o.customer?.city) set.add(o.customer.city)
    }
    return [...set].sort()
  }, [orders])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const data = orders.filter((o) => {
      const customer = o.customer?.business_name || o.customer?.name || ""
      const matchesSearch =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        customer.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || o.status === statusFilter
      const matchesDealer = dealerFilter === "all" || o.dealer?.id === dealerFilter
      const matchesPayment = paymentFilter === "all" || o.payment_status === paymentFilter
      const matchesCity = cityFilter === "all" || o.customer?.city === cityFilter
      return matchesSearch && matchesStatus && matchesDealer && matchesPayment && matchesCity
    })

    data.sort((a, b) => {
      let aVal: string | number = ""
      let bVal: string | number = ""
      if (sort.key === "customer") {
        aVal = (a.customer?.business_name || a.customer?.name || "").toLowerCase()
        bVal = (b.customer?.business_name || b.customer?.name || "").toLowerCase()
      } else if (sort.key === "grand_total") {
        aVal = a.grand_total
        bVal = b.grand_total
      } else if (sort.key === "created_at") {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      }
      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1
      return 0
    })

    return data
  }, [orders, search, statusFilter, dealerFilter, paymentFilter, cityFilter, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }))
    setPage(1)
  }

  if (orders.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <p className="text-sm font-medium">No orders found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={orderStatusOptions} className="lg:w-44" />
        <FilterSelect value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} options={paymentOptions} className="lg:w-44" />
        <FilterSelect value={dealerFilter} onChange={(e) => setDealerFilter(e.target.value)} options={dealerOptions} className="lg:w-48" />
        <FilterSelect value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} options={[{ value: "all", label: "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))]} className="lg:w-44" />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</th>
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
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{o.order_number}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{o.customer?.business_name || o.customer?.name || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{o.dealer?.business_name || o.dealer?.name || "—"}</td>
                <td className="px-4 py-3">
                  <FilterSelect value={o.status} onChange={(e) => onStatus(o.id, e.target.value)} options={orderStatusOptions.filter((s) => s.value !== "all")} className="h-8" />
                </td>
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs capitalize", paymentColor(o.payment_status as PaymentStatus))}>{o.payment_status.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{o.customer?.city || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-900">{currencyFormatter(o.grand_total)}</td>
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
