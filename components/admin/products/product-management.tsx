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
import { formatCurrency } from "./data"
import {
  getAdminProducts,
  getAdminBrands,
  getAdminCategories,
  getAdminDealers,
  approveProduct,
  rejectProduct,
  suspendProduct,
  deactivateProduct,
  deleteProduct,
  toggleProductFeatured,
  bulkUpdateProductStatus,
  bulkDeleteProducts,
  type AdminProduct,
} from "@/lib/admin/products-service"
import { toggleProductPremium, testAction } from "@/lib/admin/actions/toggle-premium"
import { Plus, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, Archive, Trash2, Power, Star, Diamond } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
]

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  INACTIVE: "bg-slate-100 text-slate-700",
  SUSPENDED: "bg-orange-100 text-orange-700",
}

interface PendingAction {
  action: ProductApprovalAction
  ids: string[]
}

export function ProductManagement() {
  const [products, setProducts] = React.useState<AdminProduct[]>([])
  const [totalProducts, setTotalProducts] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [brandFilter, setBrandFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [dealerFilter, setDealerFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [detailId, setDetailId] = React.useState<string | null>(null)
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)

  const [brandOptions, setBrandOptions] = React.useState<Array<{ value: string; label: string }>>([{ value: "all", label: "All Brands" }])
  const [categoryOptions, setCategoryOptions] = React.useState<Array<{ value: string; label: string }>>([{ value: "all", label: "All Categories" }])
  const [dealerOptions, setDealerOptions] = React.useState<Array<{ value: string; label: string }>>([{ value: "all", label: "All Dealers" }])

  // Load initial data
  React.useEffect(() => {
    async function loadData() {
      console.log("Admin Products Component - Starting initial data load")
      setLoading(true)
      try {
        console.log("Admin Products Component - Fetching brands, categories, dealers")
        const [brands, categories, dealers] = await Promise.all([
          getAdminBrands(),
          getAdminCategories(),
          getAdminDealers(),
        ])

        console.log("Admin Products Component - Filter options loaded:", { brands: brands.length, categories: categories.length, dealers: dealers.length })
        setBrandOptions([{ value: "all", label: "All Brands" }, ...brands.map((b) => ({ value: b.id, label: b.name }))])
        setCategoryOptions([{ value: "all", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))])
        setDealerOptions([{ value: "all", label: "All Dealers" }, ...dealers.map((d) => ({ value: d.id, label: d.business_name }))])
      } catch (error) {
        console.error("Admin Products Component - Error loading filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load products when filters change
  React.useEffect(() => {
    async function loadProducts() {
      console.log("Admin Products Component - Starting product load with filters:", { search, brandFilter, categoryFilter, dealerFilter, statusFilter, page })
      setLoading(true)
      try {
        const response = await getAdminProducts(
          {
            search: search || undefined,
            brandId: brandFilter !== "all" ? brandFilter : undefined,
            categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
            dealerId: dealerFilter !== "all" ? dealerFilter : undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
          page,
          PAGE_SIZE
        )

        console.log("Admin Products Component - Products loaded successfully:", response)
        setProducts(response.data)
        setTotalProducts(response.total)
        setTotalPages(response.totalPages)
      } catch (error) {
        console.error("Admin Products Component - Error loading products:", error)
        setProducts([])
        setTotalProducts(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [search, brandFilter, categoryFilter, dealerFilter, statusFilter, page])

  const paginated = products
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

  const handleActionConfirm = async (reason: string) => {
    if (!pendingAction) return
    const { action, ids } = pendingAction

    try {
      if (action === "delete") {
        // Use bulk delete for multiple items
        if (ids.length > 1) {
          await bulkDeleteProducts(ids)
        } else {
          await deleteProduct(ids[0])
        }
      } else if (action === "approve") {
        // Approve each product individually to send notifications
        for (const id of ids) {
          await approveProduct(id)
        }
      } else if (action === "reject") {
        // Reject each product individually to send notifications
        for (const id of ids) {
          await rejectProduct(id, reason)
        }
      } else if (action === "archive") {
        // Deactivate each product individually
        for (const id of ids) {
          await deactivateProduct(id)
        }
      } else if (action === "suspend") {
        // Suspend each product individually
        for (const id of ids) {
          await suspendProduct(id)
        }
      }

      // Reload products after action
      const response = await getAdminProducts(
        {
          search: search || undefined,
          brandId: brandFilter !== "all" ? brandFilter : undefined,
          categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
          dealerId: dealerFilter !== "all" ? dealerFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
        page,
        PAGE_SIZE
      )

      setProducts(response.data)
      setTotalProducts(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("Error performing action:", error)
    }

    setPendingAction(null)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      const result = await toggleProductFeatured(id)
      if (result.success) {
        await loadProducts()
      } else {
        alert(result.error || "Failed to toggle featured status")
      }
    } catch (error: any) {
      console.error("Toggle featured error:", error)
      alert(error?.message || "Failed to toggle featured status")
    }
  }

  const handleTogglePremium = async (id: string) => {
    console.log("=== handleTogglePremium CALLED ===", { id })
    try {
      const result = await toggleProductPremium(id)
      console.log("=== toggleProductPremium RESULT ===", result)
      if (result.success) {
        await loadProducts()
      } else {
        alert(result.error || "Failed to toggle premium status")
      }
    } catch (error: any) {
      console.error("=== Toggle premium CATCH ERROR ===", error)
      alert(error?.message || "Failed to toggle premium status")
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await getAdminProducts(
        {
          search: search || undefined,
          brandId: brandFilter !== "all" ? brandFilter : undefined,
          categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
          dealerId: dealerFilter !== "all" ? dealerFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
        page,
        PAGE_SIZE
      )
      setProducts(response.data)
      setTotalProducts(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (text: string) => {
    if (!detailId) return
    // Comments are not implemented in the current database schema
    // This is a placeholder for future implementation
    console.log("Comment functionality not yet implemented in database schema")
  }

  const allSelected = paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.has(id))

  if (loading) {
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
          <div className="h-10 w-full lg:w-64 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-full lg:w-44 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-full lg:w-44 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-full lg:w-48 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-10 w-full lg:w-40 bg-slate-100 rounded-lg animate-pulse" />
        </div>

        <div className="w-full h-64 rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse" />
      </motion.div>
    )
  }

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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Featured</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Premium</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((product) => {
              const checked = selectedIds.has(product.id)
              return (
                <tr key={product.id} className={cn("border-b border-slate-100 transition-colors hover:bg-slate-50/60", checked && "bg-blue-50/40")}>
                  <td className="px-4 py-3">
                    <Checkbox checked={checked} onCheckedChange={() => toggleSelect(product.id)} aria-label={`Select ${product.title}`} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{product.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.brand_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.category_name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.dealer_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusStyles[product.status] || "bg-slate-100 text-slate-700"}>{product.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${product.featured ? "text-amber-500" : "text-slate-400"}`}
                      onClick={() => handleToggleFeatured(product.id)}
                    >
                      <Star className={`h-4 w-4 ${product.featured ? "fill-amber-500" : ""}`} />
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${product.premium ? "text-purple-500" : "text-slate-400"}`}
                      onClick={() => handleTogglePremium(product.id)}
                      aria-label={product.premium ? "Remove from Premium Products" : "Add to Premium Products"}
                      title={product.premium ? "Remove from Premium Products" : "Add to Premium Products"}
                    >
                      <Diamond className={`h-4 w-4 ${product.premium ? "fill-purple-500" : ""}`} />
                    </Button>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-orange-600" onClick={() => openAction("suspend", [product.id])}>
                        <Power className="h-4 w-4" />
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

      {totalProducts > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {paginated.length} of {totalProducts} products</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 p-0">
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
