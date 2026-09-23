"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { DealerFilters } from "./dealer-filters"
import { DealerTable, SortKey, DealerAction } from "./dealer-table"
import { DealerDetailDrawer } from "./dealer-detail-drawer"
import { DealerRejectDialog } from "./dealer-reject-dialog"
import { AdminDealer, statusOptions } from "./data"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  getDealers,
  approveDealer,
  rejectDealer as rejectDealerAction,
  suspendDealer,
  activateDealer,
  deleteDealer,
} from "@/lib/admin/dealers-service"

interface ConfirmDialogState {
  open: boolean
  title: string
  description: string
  confirmText: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

const PAGE_SIZE = 5

export function DealerManagement() {
  const [dealers, setDealers] = React.useState<AdminDealer[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [stateFilter, setStateFilter] = React.useState("all")
  const [businessTypeFilter, setBusinessTypeFilter] = React.useState("all")

  const [sortKey, setSortKey] = React.useState<SortKey>("business_name")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(1)

  const [selectedDealer, setSelectedDealer] = React.useState<AdminDealer | null>(null)
  const [rejectDealer, setRejectDealer] = React.useState<AdminDealer | null>(null)
  const [confirmDialog, setConfirmDialog] = React.useState<ConfirmDialogState>({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    onConfirm: () => {},
  })

  const loadDealers = React.useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await getDealers()
      setDealers(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load dealers")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDealers()
  }, [loadDealers])

  const stateOptions = React.useMemo(() => {
    const states = Array.from(
      new Set(dealers.map((d) => d.state).filter((s) => s && s !== "—"))
    ).sort()
    return [{ value: "all", label: "All States" }, ...states.map((s) => ({ value: s, label: s }))]
  }, [dealers])

  const businessTypeOptions = React.useMemo(() => {
    const types = Array.from(
      new Set(dealers.map((d) => d.business_type).filter((t) => t && t !== "—"))
    ).sort()
    if (types.length === 0) {
      return [{ value: "all", label: "All Types" }]
    }
    return [{ value: "all", label: "All Types" }, ...types.map((t) => ({ value: t, label: t }))]
  }, [dealers])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const filteredBySearch = dealers.filter((d) => {
      const matchesSearch =
        !q ||
        d.business_name.toLowerCase().includes(q) ||
        d.owner_name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      const matchesStatus = statusFilter === "all" || d.status === statusFilter
      const matchesState = stateFilter === "all" || d.state === stateFilter
      const matchesType = businessTypeFilter === "all" || d.business_type === businessTypeFilter
      return matchesSearch && matchesStatus && matchesState && matchesType
    })

    return filteredBySearch.sort((a, b) => {
      const aVal = String(a[sortKey]).toLowerCase()
      const bVal = String(b[sortKey]).toLowerCase()
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }, [dealers, search, statusFilter, stateFilter, businessTypeFilter, sortKey, sortDirection])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  React.useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount)
    }
  }, [page, pageCount])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const openConfirm = (config: Omit<ConfirmDialogState, "open">) => {
    setConfirmDialog({ ...config, open: true })
  }

  const handleAction = async (action: DealerAction, dealer: AdminDealer) => {
    switch (action) {
      case "view":
      case "edit":
        setSelectedDealer(dealer)
        break
      case "approve":
        openConfirm({
          title: "Approve Dealer",
          description: `Are you sure you want to approve ${dealer.business_name}?`,
          confirmText: "Approve",
          variant: "default",
          onConfirm: async () => {
            try {
              await approveDealer(dealer.id)
              await loadDealers()
            } catch (err) {
              setLoadError(err instanceof Error ? err.message : "Failed to approve dealer")
            }
          },
        })
        break
      case "reject":
        setRejectDealer(dealer)
        break
      case "suspend":
        openConfirm({
          title: "Suspend Dealer",
          description: `Suspend ${dealer.business_name}? They will no longer be able to list products.`,
          confirmText: "Suspend",
          variant: "destructive",
          onConfirm: async () => {
            try {
              await suspendDealer(dealer.id)
              await loadDealers()
            } catch (err) {
              setLoadError(err instanceof Error ? err.message : "Failed to suspend dealer")
            }
          },
        })
        break
      case "activate":
        openConfirm({
          title: "Activate Dealer",
          description: `Reactivate ${dealer.business_name}?`,
          confirmText: "Activate",
          variant: "default",
          onConfirm: async () => {
            try {
              await activateDealer(dealer.id)
              await loadDealers()
            } catch (err) {
              setLoadError(err instanceof Error ? err.message : "Failed to activate dealer")
            }
          },
        })
        break
      case "delete":
        openConfirm({
          title: "Delete Dealer",
          description: `Permanently delete ${dealer.business_name}? This cannot be undone.`,
          confirmText: "Delete",
          variant: "destructive",
          onConfirm: async () => {
            try {
              await deleteDealer(dealer.id)
              await loadDealers()
            } catch (err) {
              setLoadError(err instanceof Error ? err.message : "Failed to delete dealer")
            }
          },
        })
        break
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (rejectDealer) {
      try {
        await rejectDealerAction(rejectDealer.id, reason)
        setRejectDealer(null)
        await loadDealers()
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to reject dealer")
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dealers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage, approve, and monitor all platform dealers.
        </p>
      </div>

      <DealerFilters
        search={search}
        status={statusFilter}
        state={stateFilter}
        businessType={businessTypeFilter}
        statusOptions={statusOptions}
        stateOptions={stateOptions}
        businessTypeOptions={businessTypeOptions}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1) }}
        onStateChange={(v) => { setStateFilter(v); setPage(1) }}
        onBusinessTypeChange={(v) => { setBusinessTypeFilter(v); setPage(1) }}
      />

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
          <p className="text-sm font-medium">Loading dealers...</p>
        </div>
      ) : (
        <DealerTable
          dealers={paginated}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          onAction={handleAction}
        />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {filtered.length} dealers
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <DealerDetailDrawer
        dealer={selectedDealer}
        onClose={() => setSelectedDealer(null)}
      />

      <DealerRejectDialog
        key={rejectDealer?.id || "reject"}
        dealer={rejectDealer}
        open={!!rejectDealer}
        onOpenChange={(open) => {
          if (!open) setRejectDealer(null)
        }}
        onConfirm={handleRejectConfirm}
      />

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
      />
    </motion.div>
  )
}
