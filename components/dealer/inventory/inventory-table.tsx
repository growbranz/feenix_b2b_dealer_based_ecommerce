"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"
import { StockStatusBadge, ProductStatusBadge } from "./status-badge"
import type { InventoryItem, StockStatus, ProductStatus } from "./types"

type SortField = "title" | "stock" | "price" | "created_at"
type SortDirection = "asc" | "desc"

interface InventoryTableProps {
  items: InventoryItem[]
  onRowClick?: (item: InventoryItem) => void
  onStockUpdate?: (item: InventoryItem) => void
}

export function InventoryTable({ items, onRowClick, onStockUpdate }: InventoryTableProps) {
  const [search, setSearch] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)
  const [sortField, setSortField] = React.useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [brandFilter, setBrandFilter] = React.useState<string>("all")
  const [stockStatusFilter, setStockStatusFilter] = React.useState<string>("all")
  const limit = 10

  const filtered = React.useMemo(() => {
    let result = [...items]

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q)
      )
    }

    // Filters
    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter)
    }
    if (brandFilter !== "all") {
      result = result.filter((item) => item.brand === brandFilter)
    }
    if (stockStatusFilter !== "all") {
      result = result.filter((item) => item.stock_status === stockStatusFilter)
    }

    // Sorting
    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [search, items, categoryFilter, brandFilter, stockStatusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filtered.length / limit) || 1
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  React.useEffect(() => {
    setPage(1)
    setSelectedIds(new Set())
  }, [search, categoryFilter, brandFilter, stockStatusFilter])

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log("Exporting CSV")
  }

  const categories = React.useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category)))
  }, [items])

  const brands = React.useMemo(() => {
    return Array.from(new Set(items.map((i) => i.brand)))
  }, [items])

  const lowStockItems = paginated.filter((item) => item.stock_status === "low_stock")

  if (paginated.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No inventory items found"
        description="Try adjusting your search or filters."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              {lowStockItems.length} product{lowStockItems.length !== 1 ? "s" : ""} low on stock
            </p>
            <p className="text-sm text-amber-700">
              Consider restocking to avoid stockouts
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStockStatusFilter("low_stock")} className="border-amber-300 text-amber-700 hover:bg-amber-100">
            View All
          </Button>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-xl border-slate-200 bg-slate-100/50 pl-12 pr-4 text-slate-600 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="pre_order">Pre Order</option>
          </select>

          <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-100" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export
          </Button>
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
              {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                Increase Stock
              </Button>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100">
                Decrease Stock
              </Button>
              <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
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
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 cursor-pointer" onClick={() => handleSort("title")}>
                <div className="flex items-center gap-1">
                  Title
                  {sortField === "title" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  {sortField !== "title" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                SKU
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 cursor-pointer" onClick={() => handleSort("stock")}>
                <div className="flex items-center gap-1">
                  Stock
                  {sortField === "stock" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  {sortField !== "stock" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 cursor-pointer" onClick={() => handleSort("price")}>
                <div className="flex items-center gap-1">
                  Price
                  {sortField === "price" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  {sortField !== "price" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Stock Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Product Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-slate-100 transition-colors hover:bg-slate-50",
                  item.stock_status === "low_stock" && "bg-amber-50 hover:bg-amber-100"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="max-w-[200px]">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.brand} • {item.model}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600">{item.sku}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.stock}</span>
                    {item.stock_status === "low_stock" && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹{item.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <StockStatusBadge status={item.stock_status} />
                </td>
                <td className="px-6 py-4">
                  <ProductStatusBadge status={item.product_status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onRowClick?.(item)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStockUpdate?.(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Update Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
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
              <ArrowUp className="h-4 w-4 rotate-90" />
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
              <ArrowUp className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
