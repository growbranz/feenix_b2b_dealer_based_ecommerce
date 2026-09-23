"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Download, Search, Eye, X, Calendar, Filter, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import {
  getPaymentsAction,
  getPaymentStatsAction,
  getDealerPaymentStatsAction,
  refundPaymentAction,
  getPaymentAction,
} from "@/lib/payment/actions"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import type { PaymentStats, DealerPaymentStats, PaymentFilterOptions, PaymentWithDetails } from "@/types/payment"
import { cn } from "@/lib/utils"

interface PaymentDashboardProps {
  mode: "admin" | "dealer"
  dealerId?: string
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CREATED", label: "Created" },
  { value: "AUTHORIZED", label: "Authorized" },
  { value: "CAPTURED", label: "Captured" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PARTIALLY_REFUNDED", label: "Partially Refunded" },
]

const methodOptions = [
  { value: "all", label: "All Methods" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Net Banking" },
  { value: "wallet", label: "Wallet" },
  { value: "emi", label: "EMI" },
  { value: "cod", label: "COD" },
]

function statusColor(status: string) {
  switch (status) {
    case "CAPTURED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "PENDING":
    case "CREATED":
    case "AUTHORIZED":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "FAILED":
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-200"
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "bg-amber-100 text-amber-700 border-amber-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function PaymentDashboard({ mode, dealerId }: PaymentDashboardProps) {
  const [payments, setPayments] = React.useState<PaymentWithDetails[]>([])
  const [count, setCount] = React.useState(0)
  const [adminStats, setAdminStats] = React.useState<PaymentStats | null>(null)
  const [dealerStats, setDealerStats] = React.useState<DealerPaymentStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [method, setMethod] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentWithDetails | null>(null)
  const [refundId, setRefundId] = React.useState<string | null>(null)
  const limit = 20

  const loadPayments = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const filters: PaymentFilterOptions = {
      search,
      status: status === "all" ? undefined : status,
      method: method === "all" ? undefined : method,
      dealerId,
      page,
      limit,
    }
    try {
      const [paymentsResult, statsResult] = await Promise.all([
        getPaymentsAction(filters),
        mode === "admin" ? getPaymentStatsAction() : getDealerPaymentStatsAction(dealerId || ""),
      ])
      setPayments(paymentsResult.data)
      setCount(paymentsResult.count)
      if (mode === "admin") setAdminStats(statsResult as PaymentStats)
      else setDealerStats(statsResult as DealerPaymentStats)
    } catch (e: any) {
      setError(e.message || "Failed to load payments")
    } finally {
      setLoading(false)
    }
  }, [search, status, method, page, mode, dealerId])

  React.useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const handleRefresh = () => {
    setPage(1)
    loadPayments()
  }

  const handleClearFilters = () => {
    setSearch("")
    setStatus("all")
    setMethod("all")
    setPage(1)
  }

  const handleViewPayment = async (paymentId: string) => {
    try {
      const payment = await getPaymentAction(paymentId)
      setSelectedPayment(payment as PaymentWithDetails)
    } catch (e: any) {
      console.error("Failed to load payment details:", e)
    }
  }

  const handleRefund = async () => {
    if (!refundId) return
    try {
      await refundPaymentAction(refundId)
      setRefundId(null)
      await loadPayments()
    } catch (e: any) {
      setError(e.message || "Refund failed")
    }
  }

  const totalPages = Math.ceil(count / limit) || 1
  const stats = mode === "admin" ? adminStats : dealerStats

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {error && (
        <motion.div variants={itemVariants} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </motion.div>
      )}

      {mode === "admin" && adminStats ? (
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Revenue"
            value={currencyFormatter(adminStats.revenue)}
            description="All successful payments"
            icon={TrendingUp}
            iconGradient="green"
          />
          <DashboardCard
            title="Today's Revenue"
            value={currencyFormatter(adminStats.todayRevenue)}
            description="Payments captured today"
            icon={CheckCircle}
            iconGradient="blue"
          />
          <DashboardCard
            title="Pending Payments"
            value={adminStats.pending}
            description="Awaiting completion"
            icon={AlertCircle}
            iconGradient="orange"
          />
          <DashboardCard
            title="Refunds"
            value={adminStats.refunds}
            description="Total refunds processed"
            icon={RefreshCw}
            iconGradient="red"
          />
        </motion.div>
      ) : mode === "dealer" && dealerStats ? (
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Sales"
            value={currencyFormatter(dealerStats.sales)}
            description="Total sales revenue"
            icon={TrendingUp}
            iconGradient="green"
          />
          <DashboardCard
            title="Completed"
            value={dealerStats.completed}
            description="Successful payments"
            icon={CheckCircle}
            iconGradient="blue"
          />
          <DashboardCard
            title="Pending Settlements"
            value={dealerStats.pendingSettlements}
            description="Awaiting settlement"
            icon={AlertCircle}
            iconGradient="orange"
          />
          <DashboardCard
            title="Refunds"
            value={dealerStats.refunds}
            description="Refunds processed"
            icon={RefreshCw}
            iconGradient="red"
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by order, customer, dealer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="h-10 pl-9"
              />
            </div>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="h-10 w-full sm:w-44">
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <Select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1) }} className="h-10 w-full sm:w-44">
              {methodOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters} disabled={!search && status === "all" && method === "all"}>
              <Filter className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RotateCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {loading && payments.length === 0 ? (
        <motion.div variants={itemVariants} className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </motion.div>
      ) : payments.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No payments found"
            description="No payments match your current filters."
            icon={CreditCard}
            action={
              (search || status !== "all" || method !== "all") && (
                <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
              )
            }
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Payment ID</th>
                  <th className="px-5 py-3.5">Order</th>
                  {mode === "admin" && <th className="px-5 py-3.5">Dealer</th>}
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p: PaymentWithDetails, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-600">{dateFormatter(p.created_at, "short")}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {p.razorpay_payment_id || p.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {p.order?.order_number || p.order_id}
                    </td>
                    {mode === "admin" && (
                      <td className="px-5 py-4 text-slate-600">
                        {p.order?.seller?.business_name || p.order?.seller?.name || "-"}
                      </td>
                    )}
                    <td className="px-5 py-4 text-slate-600">
                      {p.order?.buyer?.name || "-"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{currencyFormatter(p.amount)}</td>
                    <td className="px-5 py-4">
                      <Badge className={cn("border", statusColor(p.status))}>
                        {statusLabel(p.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-600 capitalize">{p.payment_method || "-"}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleViewPayment(p.id)} aria-label="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.invoice_id && (
                          <Link href={`/api/invoices/${p.invoice_id}/pdf`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Download invoice">
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {mode === "admin" && p.status === "CAPTURED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-rose-600"
                            onClick={() => setRefundId(p.id)}
                            aria-label="Refund"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              Showing {Math.min((page - 1) * limit + 1, count)} to {Math.min(page * limit, count)} of {count} payments
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-9 w-9 p-0 rounded-full">
                ←
              </Button>
              <span className="text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-9 w-9 p-0 rounded-full">
                →
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <AdminDrawer
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
        width="max-w-md"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Payment ID</p>
                <p className="text-sm font-medium text-slate-900">{selectedPayment.razorpay_payment_id || selectedPayment.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Status</p>
                <Badge className={cn("border mt-1", statusColor(selectedPayment.status))}>
                  {statusLabel(selectedPayment.status)}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Amount</p>
                <p className="text-sm font-medium text-slate-900">{currencyFormatter(selectedPayment.amount)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Method</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{selectedPayment.payment_method || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Created</p>
                <p className="text-sm font-medium text-slate-900">{dateFormatter(selectedPayment.created_at, "long")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Paid At</p>
                <p className="text-sm font-medium text-slate-900">{selectedPayment.paid_at ? dateFormatter(selectedPayment.paid_at, "long") : "-"}</p>
              </div>
            </div>

            {selectedPayment.order && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Order Information</h3>
                <div className="grid gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Order Number</p>
                    <p className="font-medium text-slate-900">{selectedPayment.order.order_number}</p>
                  </div>
                  {selectedPayment.order.product && (
                    <div>
                      <p className="text-xs text-slate-500">Product</p>
                      <p className="font-medium text-slate-900">{selectedPayment.order.product.title}</p>
                    </div>
                  )}
                  {mode === "admin" && selectedPayment.order.seller && (
                    <div>
                      <p className="text-xs text-slate-500">Dealer</p>
                      <p className="font-medium text-slate-900">{selectedPayment.order.seller.business_name || selectedPayment.order.seller.name}</p>
                    </div>
                  )}
                 {selectedPayment.order.buyer && (
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="font-medium text-slate-900">{selectedPayment.order.buyer.name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedPayment.invoice && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-xs text-slate-500">Invoice</p>
                  <p className="font-medium text-slate-900">{selectedPayment.invoice.invoice_number}</p>
                </div>
                <Link href={`/api/invoices/${selectedPayment.invoice.invoice_number}/pdf`} target="_blank">
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </Link>
              </div>
            )}

            {(selectedPayment.status === "REFUNDED" || selectedPayment.status === "PARTIALLY_REFUNDED") && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">This payment has been refunded</p>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>

      <ConfirmationDialog
        open={!!refundId}
        onOpenChange={(open) => { if (!open) setRefundId(null) }}
        title="Refund Payment"
        description="Are you sure you want to refund this payment? This action cannot be undone."
        confirmText="Refund"
        onConfirm={handleRefund}
        variant="destructive"
      />
    </motion.div>
  )
}
