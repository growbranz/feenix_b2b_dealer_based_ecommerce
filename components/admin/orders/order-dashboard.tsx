"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { OrderDataTable } from "./order-data-table"
import { ShoppingBag, Clock, Truck, Wallet } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts"
import type { AdminOrder } from "@/lib/admin/orders-service"
import {
  getAdminOrders,
  updateAdminOrderStatus,
  assignAdminOrderSeller,
  cancelAdminOrder,
  refundAdminOrder,
} from "@/lib/admin/orders-service"
import { getAdminDealers } from "@/lib/admin/enquiries-service"
import type { AdminProfile } from "@/lib/admin/enquiries-service"
import { orderStatusOptions } from "@/lib/orders/data"
import { currencyFormatter } from "@/lib/utils"

function getMonthlyOrderData(orders: AdminOrder[]) {
  const now = new Date()
  const points: { month: string; revenue: number; orders: number }[] = []
  const revenue: Record<string, number> = {}
  const volume: Record<string, number> = {}

  for (const o of orders) {
    const d = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    revenue[key] = (revenue[key] || 0) + o.grand_total
    volume[key] = (volume[key] || 0) + 1
  }

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("en-US", { month: "short" })
    points.push({
      month: label,
      revenue: revenue[key] || 0,
      orders: volume[key] || 0,
    })
  }

  return points
}

export function OrderDashboard() {
  const [orders, setOrders] = React.useState<AdminOrder[]>([])
  const [dealers, setDealers] = React.useState<AdminProfile[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [assigning, setAssigning] = React.useState<AdminOrder | null>(null)
  const [selectedDealer, setSelectedDealer] = React.useState<string>("")
  const [cancelId, setCancelId] = React.useState<string | null>(null)
  const [refundId, setRefundId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [fetchedOrders, fetchedDealers] = await Promise.all([getAdminOrders(), getAdminDealers()])
      setOrders(fetchedOrders)
      setDealers(fetchedDealers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const stats = React.useMemo(() => {
    const revenue = orders
      .filter((o) => o.payment_status === "COMPLETED")
      .reduce((sum, o) => sum + o.grand_total, 0)
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      shipped: orders.filter((o) => o.status === "SHIPPED").length,
      revenue,
    }
  }, [orders])

  const monthlyRevenue = React.useMemo(() => getMonthlyOrderData(orders), [orders])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAdminOrderStatus(id, status)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const openAssign = (order: AdminOrder) => {
    setAssigning(order)
    setSelectedDealer(order.dealer.id)
  }

  const handleAssign = async () => {
    if (!assigning) return
    try {
      await assignAdminOrderSeller(assigning.id, selectedDealer)
      setAssigning(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign dealer")
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return
    try {
      await cancelAdminOrder(cancelId)
      setCancelId(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order")
    }
  }

  const handleRefund = async () => {
    if (!refundId) return
    try {
      await refundAdminOrder(refundId)
      setRefundId(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refund order")
    }
  }

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
        <DashboardCard title="Total Orders" value={isLoading ? "—" : stats.total.toString()} icon={ShoppingBag} iconGradient="blue" />
        <DashboardCard title="Pending" value={isLoading ? "—" : stats.pending.toString()} icon={Clock} iconGradient="orange" />
        <DashboardCard title="Shipped" value={isLoading ? "—" : stats.shipped.toString()} icon={Truck} iconGradient="purple" />
        <DashboardCard title="Revenue" value={isLoading ? "—" : currencyFormatter(stats.revenue)} icon={Wallet} iconGradient="green" />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">Monthly Revenue</h3>
          <p className="text-sm text-slate-500">Revenue trend over the last 6 months</p>
          <div className="mt-4 h-64">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading...</div>
            ) : (
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
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">Order Volume</h3>
          <p className="text-sm text-slate-500">Orders per month</p>
          <div className="mt-4 h-64">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
          <p className="text-sm font-medium">Loading orders...</p>
        </div>
      ) : (
        <OrderDataTable
          orders={orders}
          onStatus={handleStatusChange}
          onAssign={openAssign}
          onCancel={setCancelId}
          onRefund={setRefundId}
        />
      )}

      <AdminDrawer
        open={!!assigning}
        onClose={() => setAssigning(null)}
        title={assigning ? `Assign ${assigning.order_number}` : "Assign Dealer"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssigning(null)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {dealers.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealer === d.id} onCheckedChange={() => setSelectedDealer(d.id)} />
              <span className="text-sm font-medium text-slate-700">{d.business_name || d.name}</span>
            </label>
          ))}
        </div>
      </AdminDrawer>

      <ConfirmationDialog open={!!cancelId} onOpenChange={(open) => { if (!open) setCancelId(null) }} title="Cancel Order" description="Are you sure you want to cancel this order?" confirmText="Cancel" onConfirm={handleCancel} variant="destructive" />
      <ConfirmationDialog open={!!refundId} onOpenChange={(open) => { if (!open) setRefundId(null) }} title="Refund Order" description="Refund payment and mark order as refunded?" confirmText="Refund" onConfirm={handleRefund} variant="destructive" />
    </motion.div>
  )
}
