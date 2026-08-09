"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/admin/shared/search-input"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { ProductDetailDrawer } from "./product-detail-drawer"
import { ProductApprovalDialog, ProductApprovalAction } from "./product-approval-dialog"
import { mockProducts, AdminProduct, ProductStatus, formatCurrency } from "./data"
import { mockBrands } from "@/components/admin/brands/data"
import { mockCategories } from "@/components/admin/categories/data"
import { mockDealers } from "@/components/admin/dealers/data"
import { Plus, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, MessageSquare, Archive, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ARCHIVED", label: "Archived" },
]

const statusStyles: Record<ProductStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  ARCHIVED: "bg-slate-100 text-slate-700",
}

interface PendingAction {
  action: ProductApprovalAction
  ids: string[]
}

export function ProductManagement() {
  const [products, setProducts] = React.useState<AdminProduct[]>(mockProducts)
  const [search, setSearch] = React.useState("")
  const [brandFilter, setBrandFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [dealerFilter, setDealerFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [detailId, setDetailId] = React.useState<string | null>(null)
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)

  const brandOptions = [{ value: "all", label: "All Brands" }, ...mockBrands.map((b) => ({ value: b.id, label: b.name }))]
  const categoryOptions = [{ value: "all", label: "All Categories" }, ...mockCategories.map((c) => ({ value: c.id, label: c.name }))]
  const dealerOptions = [{ value: "all", label: "All Dealers" }, ...mockDealers.map((d) => ({ value: d.id, label: d.business_name }))]

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((p) => {
        const matchesSearch = !q || p.title.toLowerCase().includes(q)
        const matchesBrand = brandFilter === "all" || p.brand_id === brandFilter
        const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter
        const matchesDealer = dealerFilter === "all" || p.dealer_id === dealerFilter
        const matchesStatus = statusFilter === "all" || p.status === statusFilter
        return matchesSearch && matchesBrand && matchesCategory && matchesDealer && matchesStatus
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [products, search, brandFilter, categoryFilter, dealerFilter, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const paginatedIds = paginated.map((p) => p.id)

  const detailProduct = React.useMemo(
    () => products.find((p) => p.id === detailId) || null,
    [products, detailId]
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const allSelected = paginatedIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      paginatedIds.forEach((id) => {
        if (allSelected) next.delete(id)
        else next.add(id)
      })
      return next
    })
  }

  const openAction = (action: ProductApprovalAction, ids: string[]) => {
    if (action === "delete") {
      setPendingAction({ action, ids })
      setDeleteConfirmOpen(true)
    } else {
      setPendingAction({ action, ids })
    }
  }

  const handleActionConfirm = (reason: string) => {
    if (!pendingAction) return
    const { action, ids } = pendingAction
    const now = new Date().toISOString()

    if (action === "delete") {
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)))
    } else {
      const statusMap: Record<string, ProductStatus | undefined> = {
        approve: "APPROVED",
        reject: "REJECTED",
        archive: "ARCHIVED",
      }
      const newStatus = statusMap[action]
      setProducts((prev) =>
        prev.map((p) => {
          if (!ids.includes(p.id)) return p
          const event = {
            action: action === "request" ? "Changes Requested" : `${action.charAt(0).toUpperCase() + action.slice(1)}ed`,
            by: "Admin",
            timestamp: now,
            ...(reason ? { reason } : {}),
          }
          return {
            ...p,
            ...(newStatus ? { status: newStatus } : {}),
            approval_history: [...p.approval_history, event],
            updated_at: now,
          }
        })
      )
    }
    setPendingAction(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const handleAddComment = (text: string) => {
    if (!detailId) return
    const now = new Date().toISOString()
    setProducts((prev) =>
      prev.map((p) =>
        p.id === detailId
          ? {
              ...p,
              comments: [...p.comments, { id: crypto.randomUUID(), author: "Admin", text, timestamp: now }],
              updated_at: now,
            }
          : p
      )
    )
  }

  const allSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.has(id))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Moderate, approve, and manage all product listings.</p>
        </div>
        <Button className="rounded-full px-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} options={brandOptions} className="lg:w-44" />
        <FilterSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={categoryOptions} className="lg:w-44" />
        <FilterSelect value={dealerFilter} onChange={(e) => setDealerFilter(e.target.value)} options={dealerOptions} className="lg:w-48" />
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={statusOptions} className="lg:w-40" />
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
          <span className="text-sm font-medium text-blue-900">{selectedIds.size} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => openAction("approve", Array.from(selectedIds))}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => openAction("reject", Array.from(selectedIds))}>
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => openAction("archive", Array.from(selectedIds))}>
              <Archive className="mr-1 h-4 w-4" /> Archive
            </Button>
            <Button size="sm" variant="outline" className="text-rose-600" onClick={() => openAction("delete", Array.from(selectedIds))}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dealer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((product) => {
              const brand = mockBrands.find((b) => b.id === product.brand_id)
              const category = mockCategories.find((c) => c.id === product.category_id)
              const checked = selectedIds.has(product.id)
              return (
                <tr key={product.id} className={cn("border-b border-slate-100 transition-colors hover:bg-slate-50/60", checked && "bg-blue-50/40")}>
                  <td className="px-4 py-3">
                    <Checkbox checked={checked} onCheckedChange={() => toggleSelect(product.id)} aria-label={`Select ${product.title}`} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{product.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{brand?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{category?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.dealer_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn("text-xs capitalize", statusStyles[product.status])}>{product.status.toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setDetailId(product.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-emerald-600" onClick={() => openAction("approve", [product.id])}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-600" onClick={() => openAction("reject", [product.id])}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-amber-600" onClick={() => openAction("request", [product.id])}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-600" onClick={() => openAction("archive", [product.id])}>
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-600" onClick={() => openAction("delete", [product.id])}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} products</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {pageCount}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ProductDetailDrawer
        product={detailProduct}
        onClose={() => setDetailId(null)}
        onAction={(action) => {
          if (detailProduct) openAction(action as ProductApprovalAction, [detailProduct.id])
        }}
        onAddComment={handleAddComment}
      />

      <ProductApprovalDialog
        key={pendingAction?.action || "none"}
        open={!!pendingAction && !deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null)
        }}
        action={pendingAction?.action || null}
        count={pendingAction?.ids.length}
        onConfirm={handleActionConfirm}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) setPendingAction(null)
        }}
        title="Delete Products"
        description={`Permanently delete ${pendingAction?.ids.length || 0} selected product(s)? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => handleActionConfirm("")}
        variant="destructive"
      />
    </motion.div>
  )
}
