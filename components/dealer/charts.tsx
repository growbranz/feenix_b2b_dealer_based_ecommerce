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
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { monthlyUploads, productStatusData, inventoryData, CHART_COLORS } from "./data"

const colors = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
  CHART_COLORS.senary,
]

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.75rem",
  color: "hsl(var(--card-foreground))",
}

export function DealerCharts() {
  return (
    <section className="grid gap-6 xl:grid-cols-3">
      {/* Monthly Uploads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="xl:col-span-2"
      >
        <Card className="h-[380px] rounded-2xl border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Monthly Product Uploads
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyUploads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="uploadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
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
                  dataKey="uploads"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#uploadsGradient)"
                  name="Uploads"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="h-[380px] rounded-2xl border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Product Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {productStatusData.map((entry, index) => (
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

      {/* Inventory */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="xl:col-span-3"
      >
        <Card className="h-[360px] rounded-2xl border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
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
                  dataKey="stock"
                  fill={CHART_COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  name="Stock"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}
