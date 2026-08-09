"use client"

import * as React from "react"
import Link from "next/link"
import { Package, Search, AlertTriangle, TrendingUp, IndianRupee, Boxes, Plus, ChevronLeft, ChevronRight, RefreshCw, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

function statusBarColor(status: string) {
  switch (status) {
    case "in_stock":
      return { track: "bg-emerald-100", fill: "bg-emerald-500" }
    case "low_stock":
      return { track: "bg-amber-100", fill: "bg-amber-500" }
    case "out_of_stock":
      return { track: "bg-red-100", fill: "bg-red-500" }
    default:
      return { track: "bg-slate-100", fill: "bg-slate-500" }
  }
}

function AreaChart({ color, className }: { color: string; className?: string }) {
  const points = [
    { x: 0, y: 42 },
    { x: 20, y: 30 },
    { x: 40, y: 36 },
    { x: 60, y: 24 },
    { x: 80, y: 28 },
    { x: 100, y: 20 },
    { x: 120, y: 26 },
    { x: 140, y: 18 },
    { x: 160, y: 22 },
    { x: 180, y: 14 },
    { x: 200, y: 18 },
  ]
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `M 0 60 L 0 ${points[0].y} ${points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')} L 200 60 Z`
  return (
    <svg viewBox="0 0 200 60" className={cn("h-full w-full", className)} preserveAspectRatio="none">
      <path d={area} className={cn("opacity-10", color)} fill="currentColor" />
      <path d={line} className={cn("opacity-50", color)} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={200} cy={points[points.length - 1].y} r="3.5" className={color} fill="currentColor" />
    </svg>
  )
}

function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor,
  tint,
  valueClassName = "text-3xl font-bold tracking-tight leading-none",
  chartClassName = "h-8",
  className,
}: {
  label: string
  value: React.ReactNode
  sublabel: string
  icon: React.ElementType
  iconColor: string
  tint?: string
  valueClassName?: string
  chartClassName?: string
  className?: string
}) {
  const chartColor = iconColor.replace("bg-", "text-")
  return (
    <Card className={cn(
      "rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md h-40",
      tint || "bg-card border-border/60",
      className
    )}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <div className={cn("truncate", valueClassName)}>{value}</div>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm", iconColor)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className={cn("w-full", chartClassName)}>
          <AreaChart color={chartColor} />
        </div>
      </CardContent>
    </Card>
  )
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

  const itemStart = itemsResult.count === 0 ? 0 : (page - 1) * (itemsResult.limit || 20) + 1
  const itemEnd = Math.min(page * (itemsResult.limit || 20), itemsResult.count)

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Stock"
          value={stats.total_stock}
          sublabel="Available + Reserved units"
          icon={Boxes}
          iconColor="bg-slate-500"
          tint="bg-slate-50/70 border-slate-200"
        />
        <MetricCard
          label="Available Stock"
          value={stats.available_stock}
          sublabel="Ready to sell"
          icon={Package}
          iconColor="bg-emerald-500"
          tint="bg-emerald-50/60 border-emerald-200"
        />
        <MetricCard
          label="Reserved Stock"
          value={stats.reserved_stock}
          sublabel="Awaiting payment / dispatch"
          icon={TrendingUp}
          iconColor="bg-amber-500"
          tint="bg-amber-50/60 border-amber-200"
        />
        <MetricCard
          label="Alerts"
          value={stats.low_stock + stats.out_of_stock}
          sublabel="Need attention"
          icon={AlertTriangle}
          iconColor="bg-rose-500"
          tint="bg-rose-50/60 border-rose-200"
        />
      </div>

      {/* Financials */}
      <div className="grid gap-3 lg:grid-cols-4">
        <MetricCard
          label="Inventory Value"
          value={currencyFormatter(stats.inventory_value)}
          sublabel="Available inventory value"
          icon={IndianRupee}
          iconColor="bg-emerald-500"
          valueClassName="text-3xl font-bold tracking-tight leading-none text-emerald-600"
          className="lg:col-span-2 h-44"
          chartClassName="h-14"
          tint="bg-emerald-50/60 border-emerald-200"
        />
        <MetricCard
          label="Reserved Value"
          value={currencyFormatter(stats.reserved_value)}
          sublabel="Reserved inventory value"
          icon={IndianRupee}
          iconColor="bg-amber-500"
          valueClassName="text-3xl font-bold tracking-tight leading-none text-amber-600"
          chartClassName="h-10"
          tint="bg-amber-50/60 border-amber-200"
        />
        <MetricCard
          label="Today's Movement"
          value={stats.todays_movement}
          sublabel="Units moved today"
          icon={TrendingUp}
          iconColor="bg-blue-500"
          chartClassName="h-10"
          tint="bg-blue-50/60 border-blue-200"
        />
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-border/40 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search product, SKU, brand or model..."
              className="h-11 w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 shadow-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="h-11 w-full rounded-xl border-border/40 bg-slate-50 sm:w-44"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <Button
              variant="outline"
              onClick={refreshStats}
              className="h-11 rounded-xl px-5"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {loading && itemsResult.data.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : itemsResult.data.length === 0 ? (
        <EmptyState
          title="No inventory yet"
          description="Products added to your inventory will appear here."
          icon={Package}
          action={
            <Link href="/dealer/products/add">
              <Button className="h-11 rounded-lg px-5">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">SKU</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Brand</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Status</th>
                  {isAdmin && <th className="px-5 py-3.5">Dealer</th>}
                  <th className="px-5 py-3.5">Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itemsResult.data.map((item) => {
                  const bar = statusBarColor(item.stock_status)
                  const pct = item.total_stock > 0 ? Math.min(100, Math.round((item.stock / item.total_stock) * 100)) : 0
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground">{item.model}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{item.sku}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.category}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.brand}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{item.stock}</div>
                        <div className="text-xs text-muted-foreground">of {item.total_stock}</div>
                        <div className={cn("mt-2 h-1.5 w-20 overflow-hidden rounded-full", bar.track)}>
                          <div className={cn("h-full rounded-full", bar.fill)} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={cn("inline-flex items-center gap-1.5 rounded-full border-0 px-2.5 py-1 text-xs font-medium", statusColor(item.stock_status))}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {statusLabel(item.stock_status)}
                        </Badge>
                      </td>
                      {isAdmin && <td className="px-5 py-4 text-muted-foreground">{item.dealer}</td>}
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {dateFormatter(item.updated_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Actions">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing {itemStart} to {itemEnd} of {itemsResult.count} products
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                disabled={page === 1}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {page}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={page === itemsResult.totalPages}
                className="h-9 w-9 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

