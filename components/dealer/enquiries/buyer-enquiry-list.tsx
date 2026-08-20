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
import { statusOptions, priorityOptions } from "@/lib/enquiry/data"
import type { DealerEnquiryListItem, EnquiryStatus } from "@/types/enquiries"
import { dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Eye, Inbox, RefreshCw, Store } from "lucide-react"

const PAGE_SIZE = 10

const statusStyles: Record<EnquiryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-blue-100 text-blue-700",
}

const priorityBadge: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-rose-100 text-rose-700",
}

const buyerStatusOptions = statusOptions.filter((o) =>
  ["all", "PENDING", "ASSIGNED", "ACCEPTED", "REJECTED", "COMPLETED"].includes(o.value)
)

interface BuyerEnquiryListProps {
  initialEnquiries: DealerEnquiryListItem[]
  sellerNames: Record<string, string>
}

export function BuyerEnquiryList({ initialEnquiries, sellerNames }: BuyerEnquiryListProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [priorityFilter, setPriorityFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialEnquiries
      .filter((e) => {
        const matchesSearch =
          !q ||
          e.product.title.toLowerCase().includes(q) ||
          (sellerNames[e.id] || "").toLowerCase().includes(q)
        const matchesStatus = statusFilter === "all" || e.status === statusFilter
        const matchesPriority = priorityFilter === "all" || e.priority === priorityFilter
        return matchesSearch && matchesStatus && matchesPriority
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [initialEnquiries, search, statusFilter, priorityFilter, sellerNames])

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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Enquiries</h1>
          <p className="mt-1 text-sm text-slate-500">Enquiries you've sent to sellers.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isPending} className="h-10 w-fit rounded-xl px-4">
          <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput placeholder="Search by product or seller..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={buyerStatusOptions} className="md:w-44" />
        <FilterSelect value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} options={priorityOptions} className="md:w-44" />
      </div>

      {isPending ? (
        <TableSkeleton rows={5} />
      ) : initialEnquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No enquiries yet"
          description="Enquiries you send to sellers will show up here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No matching enquiries"
          description="Try adjusting your search, status or priority filter."
        />
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{e.product.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{sellerNames[e.id] || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{e.quantity}</td>
                    <td className="px-4 py-3"><Badge className={cn("text-xs capitalize", priorityBadge[e.priority])}>{e.priority.toLowerCase()}</Badge></td>
                    <td className="px-4 py-3"><Badge className={cn("text-xs capitalize", statusStyles[e.status])}>{e.status.toLowerCase()}</Badge></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{dateFormatter(e.created_at, "short")}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dealer/my-enquiries/${e.id}`}>
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} enquiries</p>
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