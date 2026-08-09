"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { OrderDataTable } from "./order-data-table"
import { mockOrders, Order, OrderStatus, dealerOptions, paymentColor } from "@/lib/orders/data"
import { ShoppingBag, Clock, Truck, Wallet } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts"

const monthlyRevenue = [
  { month: "Jan", revenue: 120000, orders: 12 },
  { month: "Feb", revenue: 180000, orders: 18 },
  { month: "Mar", revenue: 150000, orders: 15 },
  { month: "Apr", revenue: 220000, orders: 22 },
  { month: "May", revenue: 280000, orders: 28 },
  { month: "Jun", revenue: 340000, orders: 34 },
]

export function OrderDashboard() {
  const [orders, setOrders] = React.useState<Order[]>(mockOrders)
  const [assigning, setAssigning] = React.useState<Order | null>(null)
  const [selectedDealer, setSelectedDealer] = React.useState<string>("")
  const [cancelId, setCancelId] = React.useState<string | null>(null)
  const [refundId, setRefundId] = React.useState<string | null>(null)

  const stats = React.useMemo(() => {
    const totalRevenue = orders.filter((o) => o.payment_status === "COMPLETED").reduce((sum, o) => sum + o.grand_total, 0)
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
      packed: orders.filter((o) => o.status === "PACKED").length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
      revenue: totalRevenue,
    }
  }, [orders])

  const changeStatus = (id: string, status: OrderStatus, actor = "Admin") => {
    const now = new Date().toISOString()
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status, timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status, actor, timestamp: now, note: `Status set to ${status}` }], updated_at: now }
          : o
      )
    )
  }

  const openAssign = (order: Order) => {
    setAssigning(order)
    setSelectedDealer(order.dealer.id)
  }

  const handleAssign = () => {
    if (!assigning) return
    const dealer = dealerOptions.find((d) => d.id === selectedDealer)
    const now = new Date().toISOString()
    setOrders((prev) =>
      prev.map((o) =>
        o.id === assigning.id
          ? { ...o, dealer: dealer || o.dealer, timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status: o.status, actor: "Admin", timestamp: now, note: `Assigned to ${dealer?.name || "unknown"}` }], updated_at: now }
          : o
      )
    )
    setAssigning(null)
  }

  const handleCancel = () => {
    if (cancelId) {
      changeStatus(cancelId, "CANCELLED")
      setCancelId(null)
    }
  }

  const handleRefund = () => {
    if (refundId) {
      const now = new Date().toISOString()
      setOrders((prev) =>
        prev.map((o) =>
          o.id === refundId
            ? { ...o, status: "REFUNDED", payment_status: "REFUNDED", timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status: "REFUNDED", actor: "Admin", timestamp: now, note: "Order refunded" }], updated_at: now }
            : o
        )
      )
      setRefundId(null)
    }
  }

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Manage orders from quotation to delivery.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Orders" value={stats.total.toString()} icon={ShoppingBag} iconGradient="blue" />
        <DashboardCard title="Pending" value={stats.pending.toString()} icon={Clock} iconGradient="orange" />
        <DashboardCard title="Shipped" value={stats.shipped.toString()} icon={Truck} iconGradient="purple" />
        <DashboardCard title="Revenue" value={formatCurrency(stats.revenue)} icon={Wallet} iconGradient="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Monthly Revenue</h3>
          <p className="text-sm text-slate-500">Revenue trend over the last 6 months</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Order Volume</h3>
          <p className="text-sm text-slate-500">Orders per month</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <OrderDataTable orders={orders} onStatus={changeStatus} onAssign={openAssign} onCancel={setCancelId} onRefund={setRefundId} paymentColor={paymentColor} />

      <AdminDrawer
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title={assigning ? `Assign ${assigning.id}` : "Assign Dealer"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssigning(null)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {dealerOptions.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealer === d.id} onCheckedChange={() => setSelectedDealer(d.id)} />
              <span className="text-sm font-medium text-slate-700">{d.name}</span>
            </label>
          ))}
        </div>
      </AdminDrawer>

      <ConfirmationDialog open={!!cancelId} onOpenChange={(open) => { if (!open) setCancelId(null) }} title="Cancel Order" description="Are you sure you want to cancel this order?" confirmText="Cancel" onConfirm={handleCancel} variant="destructive" />
      <ConfirmationDialog open={!!refundId} onOpenChange={(open) => { if (!open) setRefundId(null) }} title="Refund Order" description="Refund payment and mark order as refunded?" confirmText="Refund" onConfirm={handleRefund} variant="destructive" />
    </motion.div>
  )
}

export { paymentColor }
