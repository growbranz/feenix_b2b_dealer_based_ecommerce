"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Check,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"
import type { RecentProduct, RecentProductStatus } from "./types"

const statusVariant = (status: RecentProductStatus) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
    case "INACTIVE":
      return "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20"
    case "OUT_OF_STOCK":
      return "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
    case "PENDING":
      return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const statusLabel = (status: RecentProductStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())

interface ProductsTableProps {
  products: RecentProduct[]
  onRowClick?: (product: RecentProduct) => void
}

export function ProductsTable({ products, onRowClick }: ProductsTableProps) {
  const [search, setSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [view, setView] = React.useState<"table" | "grid">("table")
  const [page, setPage] = React.useState(1)
  const limit = 10

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [search, products])

  const totalPages = Math.ceil(filtered.length / limit) || 1
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  React.useEffect(() => {
    setPage(1)
    setSelectedIds(new Set())
  }, [search])

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginated.map((p) => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action}:`, Array.from(selectedIds))
  }

  if (paginated.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try adjusting your search or add a new product."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-slate-100/50 pl-12 pr-4 text-slate-600 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-100">
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg",
                view === "table" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg",
                view === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              )}
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 p-4"
          >
            <span className="text-sm font-semibold text-blue-900">
              {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("activate")}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("deactivate")}
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Deactivate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "table" ? (
        /* Table View */
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Brand
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="max-w-[200px]">
                        <p className="font-semibold text-slate-900">{product.title}</p>
                        <p className="text-xs text-slate-500">SKU: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.brand}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.model}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹1,299</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full border-0 px-3 py-1 text-xs font-semibold",
                        statusVariant(product.status)
                      )}
                    >
                      {statusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onRowClick?.(product)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <Package className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full border-0 px-3 py-1 text-xs font-semibold",
                    statusVariant(product.status)
                  )}
                >
                  {statusLabel(product.status)}
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="truncate font-bold text-slate-900">
                  {product.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {product.brand} • {product.model}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">₹1,299</span>
                  <span className="text-sm text-slate-600">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-100"
                  onClick={() => onRowClick?.(product)}
                >
                  View
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > limit && (
        <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            Showing {start + 1}-{Math.min(start + limit, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <span className="min-w-[3rem] text-center text-sm font-semibold text-slate-900">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
