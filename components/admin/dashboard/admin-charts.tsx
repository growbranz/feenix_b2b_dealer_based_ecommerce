"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import {
  monthlyDealerRegistrations,
  productApprovalData,
  ordersOverviewData,
  ADMIN_CHART_COLORS,
} from "./data"

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.75rem",
  color: "hsl(var(--card-foreground))",
}

const colors = [
  ADMIN_CHART_COLORS.primary,
  ADMIN_CHART_COLORS.tertiary,
  ADMIN_CHART_COLORS.quaternary,
]

export function AdminCharts() {
  return (
    <section className="grid gap-6 xl:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="xl:col-span-2"
      >
        <Card className="h-[380px] rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Monthly Dealer Registrations
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyDealerRegistrations}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="registrationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ADMIN_CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ADMIN_CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke={ADMIN_CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#registrationsGradient)"
                  name="Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="h-[380px] rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Product Approval</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productApprovalData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {productApprovalData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="xl:col-span-3"
      >
        <Card className="h-[360px] rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Orders Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="orders"
                  fill={ADMIN_CHART_COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  name="Orders"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}
