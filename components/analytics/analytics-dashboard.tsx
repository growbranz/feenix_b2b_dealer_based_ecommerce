"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { KpiCard } from "./kpi-card"
import { AnalyticsFilters, AnalyticsFiltersState } from "./analytics-filters"
import { getDashboardData } from "@/lib/analytics/actions"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16"]

interface AnalyticsDashboardProps {
  mode: "admin" | "dealer"
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

export function AnalyticsDashboard({ mode }: AnalyticsDashboardProps) {
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<AnalyticsFiltersState>({})
  const [data, setData] = React.useState<any>(null)
  const isAdmin = mode === "admin"

  async function load() {
    setLoading(true)
    try {
      const result = await getDashboardData(filters)
      setData(result)
    } catch (e: any) {
      console.error("Failed to load dashboard data", e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  const stats = data?.stats

  return (
    <div className="space-y-6">
      <AnalyticsFilters
        filters={filters}
        onChange={setFilters}
        onApply={load}
        isAdmin={isAdmin}
      />

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} subtitle="All time" icon={DollarSign} delay={0} />
          <KpiCard title="Today's Revenue" value={formatCurrency(stats.todayRevenue)} icon={TrendingUp} delay={0.05} />
          <KpiCard title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} icon={BarChart3} delay={0.1} />
          <KpiCard title="Annual Revenue" value={formatCurrency(stats.annualRevenue)} icon={Activity} delay={0.15} />
          <KpiCard title="Total Orders" value={stats.totalOrders} subtitle={`${stats.completedOrders} completed`} icon={ShoppingCart} delay={0.2} />
          <KpiCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} delay={0.25} />
          <KpiCard title="Cancelled Orders" value={stats.cancelledOrders} icon={AlertTriangle} color="text-rose-500" delay={0.3} />
          <KpiCard title="Active Dealers" value={stats.activeDealers} icon={Users} delay={0.35} />
          <KpiCard title="Total Products" value={stats.totalProducts} icon={Package} delay={0.4} />
          <KpiCard title="Inventory Value" value={formatCurrency(stats.inventoryValue)} icon={PieChart} delay={0.45} />
          <KpiCard title="Low Stock Products" value={stats.lowStockProducts} color="text-amber-500" icon={AlertTriangle} delay={0.5} />
          <KpiCard title="Payment Success Rate" value={`${stats.paymentSuccessRate.toFixed(1)}%`} icon={CreditCard} delay={0.55} />
        </div>
      )}

      {data && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold">Orders Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.ordersTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold">Payments Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.paymentsTrend}>
                <defs>
                  <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorPayments)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold">{isAdmin ? "Dealer Performance" : "Top Categories"}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={isAdmin ? data.dealerPerformance : data.topCategories}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold">Top Products by Inventory Value</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie data={data.topProducts} dataKey="value" nameKey="name" outerRadius={80} label>
                  {data.topProducts.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-semibold">Customer Acquisition</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.customerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  )
}
