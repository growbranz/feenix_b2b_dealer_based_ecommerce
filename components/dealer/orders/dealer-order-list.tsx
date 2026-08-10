"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/dealer/skeletons"
import { OrderStatus, orderStatusOptions, statusColor, paymentColor } from "@/lib/orders/data"
import type { DealerOrderListItem } from "@/types/orders"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Eye, PackageSearch, RefreshCw } from "lucide-react"

const PAGE_SIZE = 10

interface DealerOrderListProps {
  initialOrders: DealerOrderListItem[]
}

export function DealerOrderList({ initialOrders }: DealerOrderListProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialOrders
      .filter((o) => {
        const matchesSearch =
          !q ||
          o.order_number.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          (o.customer.business_name || "").toLowerCase().includes(q)
        const matchesStatus = statusFilter === "all" || o.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [initialOrders, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Orders assigned to you.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isPending} className="h-10 w-fit rounded-xl px-4">
          <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput placeholder="Search by order #, customer or business..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={orderStatusOptions} className="md:w-48" />
      </div>

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : initialOrders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No orders yet"
          description="Orders placed against your products will show up here once buyers start ordering."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No matching orders"
          description="Try adjusting your search or status filter."
        />
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{o.order_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{o.customer.name}</td>
                    <td className="px-4 py-3"><Badge className={cn("text-xs capitalize", statusColor(o.status as OrderStatus))}>{o.status.toLowerCase()}</Badge></td>
                    <td className="px-4 py-3"><Badge className={cn("text-xs capitalize", paymentColor(o.payment_status))}>{o.payment_status.toLowerCase()}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-900">{currencyFormatter(o.grand_total)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{dateFormatter(o.created_at, "short")}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dealer/orders/${o.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} orders</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">←</Button>
              <span className="text-sm font-medium text-slate-600">Page {currentPage} of {pageCount}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="h-8 w-8 p-0">→</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
