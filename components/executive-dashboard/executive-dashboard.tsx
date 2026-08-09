"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/analytics/kpi-card"
import { getExecutiveDashboardData } from "@/lib/reports/actions"
import { forecastRevenue } from "@/lib/forecast/actions"
import {
  Activity,
  TrendingUp,
  Calendar,
  CalendarDays,
  CalendarRange,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  RefreshCw,
  Award,
  ThumbsDown,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#84cc16"]

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

export function ExecutiveDashboard() {
  const [data, setData] = React.useState<any>(null)
  const [forecast, setForecast] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  async function load() {
    setLoading(true)
    try {
      const [dashboard, revForecast] = await Promise.all([
        getExecutiveDashboardData({}),
        forecastRevenue({}),
      ])
      setData(dashboard)
      setForecast(revForecast)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const { kpis, topDealers, lowestDealers, topCustomers, topProducts, topCategories, topBrands, inventoryStatus, outstandingPayments, pendingRefunds } = data

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Executive Dashboard</h2>
          <p className="text-sm text-slate-500">Business health, forecasts and performance rankings</p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Business Health Score" value={`${kpis.businessHealthScore}/100`} icon={Activity} color="text-emerald-500" />
        <KpiCard title="Monthly Growth" value={`${kpis.monthlyGrowth}%`} icon={TrendingUp} color="text-blue-500" />
        <KpiCard title="Quarterly Growth" value={`${kpis.quarterlyGrowth}%`} icon={Calendar} color="text-purple-500" />
        <KpiCard title="Yearly Growth" value={`${kpis.yearlyGrowth}%`} icon={CalendarDays} color="text-orange-500" />
        <KpiCard title="Revenue Forecast" value={formatCurrency(kpis.revenueForecast)} icon={CalendarRange} color="text-indigo-500" />
        <KpiCard title="Profit Estimate" value={formatCurrency(kpis.profitEstimate)} icon={DollarSign} color="text-emerald-500" />
        <KpiCard title="Outstanding Payments" value={kpis.outstandingPayments} icon={AlertTriangle} color="text-amber-500" />
        <KpiCard title="Pending Refunds" value={kpis.pendingRefunds} icon={AlertTriangle} color="text-rose-500" />
      </div>

      {forecast && (
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold">Revenue Forecast</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={forecast.forecast}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="actual" stroke="#f97316" fillOpacity={0} strokeWidth={2} />
              <Area type="monotone" dataKey="predicted" stroke="#8b5cf6" fill="url(#colorForecast)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <RankingCard title="Top Performing Dealers" icon={Award} data={topDealers} />
        <RankingCard title="Lowest Performing Dealers" icon={ThumbsDown} data={lowestDealers} />
        <RankingCard title="Top Customers" icon={Users} data={topCustomers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankingCard title="Top Products" icon={Package} data={topProducts} />
        <RankingCard title="Top Categories" icon={Package} data={topCategories} />
        <RankingCard title="Top Brands" icon={Package} data={topBrands} />
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-sm font-semibold">Inventory Status</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatusPill label="Fast Moving" count={inventoryStatus.fastMoving.length} color="bg-emerald-100 text-emerald-700" />
          <StatusPill label="Slow Moving" count={inventoryStatus.slowMoving.length} color="bg-amber-100 text-amber-700" />
          <StatusPill label="Dead Stock" count={inventoryStatus.deadStock.length} color="bg-rose-100 text-rose-700" />
        </div>
        {inventoryStatus.deadStock.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto text-sm">
            {inventoryStatus.deadStock.slice(0, 10).map((item: any, i: number) => (
              <div key={i} className="flex justify-between border-b py-1">
                <span>{item.product?.title || item.product_id}</span>
                <span className="text-slate-500">{item.available_stock} units</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold">Outstanding Payments</h3>
          {outstandingPayments.length === 0 ? (
            <p className="text-sm text-slate-500">No outstanding payments.</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {outstandingPayments.map((p: any) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.id.slice(0, 8)}</span>
                  <span>{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
          <h3 className="mb-3 text-sm font-semibold">Pending Refunds</h3>
          {pendingRefunds.length === 0 ? (
            <p className="text-sm text-slate-500">No pending refunds.</p>
          ) : (
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {pendingRefunds.map((p: any) => (
                <li key={p.id} className="flex justify-between">
                  <span>{p.id.slice(0, 8)}</span>
                  <span>{formatCurrency(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function RankingCard({ title, icon: Icon, data }: { title: string; icon: any; data: any[] }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-orange-500" />
        {title}
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 5)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.slice(0, 5).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs">{label}</p>
    </div>
  )
}
