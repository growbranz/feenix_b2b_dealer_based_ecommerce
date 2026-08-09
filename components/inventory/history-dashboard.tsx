"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Package,
  Search,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Undo2,
  AlertTriangle,
  SearchX,
  ShoppingCart,
  ShoppingBag,
  Lock,
  Unlock,
  History,
  RotateCcw,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { cn, dateFormatter } from "@/lib/utils"

interface LedgerEntry {
  id: string
  created_at: string
  product?: { title?: string | null; slug?: string | null } | null
  movement_type: string
  previous_quantity: number
  updated_quantity: number
  reason?: string | null
}

interface HistoryDashboardProps {
  initialLedger: LedgerEntry[]
}

const movementTypes = [
  "ADJUSTMENT",
  "PURCHASE",
  "SALE",
  "RESERVATION",
  "RELEASE",
  "TRANSFER",
  "RETURN",
  "DAMAGE",
  "LOST",
]

function movementMeta(type: string): { color: string; icon: LucideIcon } {
  switch (type) {
    case "PURCHASE":
      return { color: "bg-emerald-100 text-emerald-700", icon: ShoppingCart }
    case "SALE":
      return { color: "bg-rose-100 text-rose-700", icon: ShoppingBag }
    case "RESERVATION":
      return { color: "bg-amber-100 text-amber-700", icon: Lock }
    case "RELEASE":
      return { color: "bg-sky-100 text-sky-700", icon: Unlock }
    case "TRANSFER":
      return { color: "bg-purple-100 text-purple-700", icon: ArrowRightLeft }
    case "ADJUSTMENT":
      return { color: "bg-slate-100 text-slate-700", icon: SlidersHorizontal }
    case "RETURN":
      return { color: "bg-teal-100 text-teal-700", icon: Undo2 }
    case "DAMAGE":
      return { color: "bg-orange-100 text-orange-700", icon: AlertTriangle }
    case "LOST":
      return { color: "bg-red-100 text-red-700", icon: SearchX }
    default:
      return { color: "bg-gray-100 text-gray-700", icon: Package }
  }
}

function MovementBadge({ type }: { type: string }) {
  const { color, icon: Icon } = movementMeta(type)
  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-0 px-2.5 py-1 text-xs font-medium",
        color
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {type}
    </Badge>
  )
}

function ChangeIndicator({ previous, updated }: { previous: number; updated: number }) {
  const change = updated - previous
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
        <ArrowUpRight className="h-4 w-4" />+{change}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
        <ArrowDownRight className="h-4 w-4" />
        {change}
      </span>
    )
  }
  return <span className="font-medium text-muted-foreground">0</span>
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  tint,
}: {
  label: string
  value: React.ReactNode
  icon: LucideIcon
  iconColor: string
  tint: string
}) {
  return (
    <Card className={cn("rounded-2xl border shadow-sm", tint)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm", iconColor)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HistoryDashboard({ initialLedger }: HistoryDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [search, setSearch] = React.useState("")
  const [movementFilter, setMovementFilter] = React.useState("all")
  const [dateFilter, setDateFilter] = React.useState("all")

  const filtered = React.useMemo(() => {
    const now = new Date()
    return initialLedger.filter((entry) => {
      const matchesSearch = search.trim()
        ? (entry.product?.title || "").toLowerCase().includes(search.toLowerCase())
        : true
      const matchesMovement = movementFilter === "all" ? true : entry.movement_type === movementFilter
      let matchesDate = true
      if (dateFilter !== "all") {
        const entryDate = new Date(entry.created_at)
        const days = parseInt(dateFilter, 10)
        const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        matchesDate = entryDate >= threshold
      }
      return matchesSearch && matchesMovement && matchesDate
    })
  }, [initialLedger, search, movementFilter, dateFilter])

  const total = filtered.length
  const added = filtered.reduce((sum, e) => sum + Math.max(0, e.updated_quantity - e.previous_quantity), 0)
  const reduced = filtered.reduce(
    (sum, e) => sum + Math.abs(Math.min(0, e.updated_quantity - e.previous_quantity)),
    0
  )
  const adjustments = filtered.filter((e) => e.movement_type === "ADJUSTMENT").length
  const lastUpdated = initialLedger[0]?.created_at
    ? dateFormatter(initialLedger[0].created_at)
    : "—"

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory History"
        description="Track all stock movements and adjustments"
        breadcrumb={[
          { label: "Dealer", href: "/dealer" },
          { label: "Inventory", href: "/dealer/inventory" },
          { label: "History" },
        ]}
        actions={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </span>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isPending}
              className="h-11 rounded-xl px-5"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Movements"
          value={total.toLocaleString()}
          icon={TrendingUp}
          iconColor="bg-blue-500"
          tint="bg-blue-50/60 border-blue-200"
        />
        <MetricCard
          label="Stock Added"
          value={`+${added.toLocaleString()}`}
          icon={ArrowUpRight}
          iconColor="bg-emerald-500"
          tint="bg-emerald-50/60 border-emerald-200"
        />
        <MetricCard
          label="Stock Reduced"
          value={`-${reduced.toLocaleString()}`}
          icon={ArrowDownRight}
          iconColor="bg-rose-500"
          tint="bg-rose-50/60 border-rose-200"
        />
        <MetricCard
          label="Adjustments"
          value={adjustments.toLocaleString()}
          icon={SlidersHorizontal}
          iconColor="bg-purple-500"
          tint="bg-purple-50/60 border-purple-200"
        />
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-border/40 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search product..."
              className="h-11 w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 shadow-none ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value)}
              className="h-11 w-full rounded-xl border-border/40 bg-slate-50 sm:w-44"
            >
              <option value="all">All Movements</option>
              {movementTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 w-full rounded-xl border-border/40 bg-slate-50 sm:w-44"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("")
                setMovementFilter("all")
                setDateFilter("all")
              }}
              className="h-11 rounded-xl px-4"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {isPending && filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No stock movements yet"
          description="Your inventory adjustments and stock movements will appear here."
          action={
            <Link href="/dealer/products">
              <Button className="h-11 rounded-lg px-5">
                <Plus className="mr-2 h-4 w-4" />
                Go to My Products
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Movement</th>
                  <th className="px-5 py-3.5 text-right">Previous</th>
                  <th className="px-5 py-3.5 text-right">Updated</th>
                  <th className="px-5 py-3.5 text-right">Change</th>
                  <th className="px-5 py-3.5">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((entry) => {
                  const productTitle = entry.product?.title || "Unknown"
                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                        {dateFormatter(entry.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{productTitle}</div>
                            {entry.product?.slug && (
                              <div className="text-xs text-muted-foreground">{entry.product.slug}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <MovementBadge type={entry.movement_type} />
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-foreground">
                        {entry.previous_quantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-foreground">
                        {entry.updated_quantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ChangeIndicator
                          previous={entry.previous_quantity}
                          updated={entry.updated_quantity}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className="block max-w-[240px] truncate text-muted-foreground">
                          {entry.reason || "—"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {initialLedger.length} movements
            </p>
          </div>
        </>
      )}
    </div>
  )
}
