"use client"

import * as React from "react"
import { Package, Search, AlertTriangle, TrendingUp, DollarSign, Boxes } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { getInventoryItems, getInventoryStats } from "@/lib/inventory/data"
import { cn, currencyFormatter, dateFormatter } from "@/lib/utils"
import type { InventoryStats, PaginatedResult, InventoryListItem } from "@/types/inventory"

interface InventoryDashboardProps {
  initialStats: InventoryStats
  initialItems: PaginatedResult<InventoryListItem>
  isAdmin?: boolean
  dealerId?: string
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
]

function statusColor(status: string) {
  switch (status) {
    case "in_stock":
      return "bg-green-100 text-green-700"
    case "low_stock":
      return "bg-yellow-100 text-yellow-700"
    case "out_of_stock":
      return "bg-red-100 text-red-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "in_stock":
      return "In Stock"
    case "low_stock":
      return "Low Stock"
    case "out_of_stock":
      return "Out of Stock"
    default:
      return status
  }
}

export function InventoryDashboard({
  initialStats,
  initialItems,
  isAdmin = false,
  dealerId,
}: InventoryDashboardProps) {
  const [stats, setStats] = React.useState<InventoryStats>(initialStats)
  const [itemsResult, setItemsResult] = React.useState<PaginatedResult<InventoryListItem>>(initialItems)
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const result = await getInventoryItems({
        search,
        status: status === "all" ? undefined : status,
        page,
        limit: 20,
        dealerId,
      })
      if (!cancelled) {
        setItemsResult(result)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [search, status, page, dealerId])

  async function refreshStats() {
    const next = await getInventoryStats({ dealerId })
    setStats(next)
  }

  function nextPage() {
    if (page < itemsResult.totalPages) setPage(page + 1)
  }

  function prevPage() {
    if (page > 1) setPage(page - 1)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Boxes className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_stock}</div>
            <p className="text-xs text-slate-500">Available + Reserved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available_stock}</div>
            <p className="text-xs text-slate-500">Ready to sell</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reserved Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reserved_stock}</div>
            <p className="text-xs text-slate-500">Awaiting payment / dispatch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.low_stock + stats.out_of_stock}</div>
            <p className="text-xs text-slate-500">Low / out of stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter(stats.inventory_value)}</div>
            <p className="text-xs text-slate-500">Available value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reserved Value</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter(stats.reserved_value)}</div>
            <p className="text-xs text-slate-500">Reserved value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Movement</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todays_movement}</div>
            <p className="text-xs text-slate-500">Units moved today</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by product, SKU, brand, model..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        <Button variant="outline" onClick={refreshStats}>
          Refresh
        </Button>
      </div>

      {loading && itemsResult.data.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : itemsResult.data.length === 0 ? (
        <EmptyState
          title="No inventory found"
          description="Try changing the search or filters."
          icon={Package}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-4 py-3 font-medium">Dealer</th>}
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {itemsResult.data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-slate-500">{item.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 text-slate-600">{item.brand}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.stock}</div>
                      <div className="text-xs text-slate-500">of {item.total_stock}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("text-xs", statusColor(item.stock_status))}>
                        {statusLabel(item.stock_status)}
                      </Badge>
                    </td>
                    {isAdmin && <td className="px-4 py-3 text-slate-600">{item.dealer}</td>}
                    <td className="px-4 py-3 text-slate-500">
                      {dateFormatter(item.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {itemsResult.page} of {itemsResult.totalPages} ({itemsResult.count} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={page === itemsResult.totalPages}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

