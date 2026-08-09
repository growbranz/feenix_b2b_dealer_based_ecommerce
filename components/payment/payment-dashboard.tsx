"use client"

import * as React from "react"
import Link from "next/link"
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, XCircle, RefreshCw, Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getPaymentsAction,
  getPaymentStatsAction,
  getDealerPaymentStatsAction,
  refundPaymentAction,
} from "@/lib/payment/actions"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import type { PaymentStats, DealerPaymentStats, PaymentFilterOptions } from "@/types/payment"

interface PaymentDashboardProps {
  mode: "admin" | "dealer"
  dealerId?: string
}

const statusOptions = [
  { value: "all", label: "All" },
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
  { value: "all", label: "All" },
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
      return "bg-emerald-100 text-emerald-700"
    case "PENDING":
    case "CREATED":
    case "AUTHORIZED":
      return "bg-blue-100 text-blue-700"
    case "FAILED":
    case "CANCELLED":
      return "bg-rose-100 text-rose-700"
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-slate-100 text-slate-700"
  }
}

export function PaymentDashboard({ mode, dealerId }: PaymentDashboardProps) {
  const [payments, setPayments] = React.useState<any[]>([])
  const [count, setCount] = React.useState(0)
  const [adminStats, setAdminStats] = React.useState<PaymentStats | null>(null)
  const [dealerStats, setDealerStats] = React.useState<DealerPaymentStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [method, setMethod] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const limit = 20

  async function load() {
    setLoading(true)
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
      console.error("Payment dashboard load error:", e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
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
        if (!cancelled) {
          setPayments(paymentsResult.data)
          setCount(paymentsResult.count)
          if (mode === "admin") setAdminStats(statsResult as PaymentStats)
          else setDealerStats(statsResult as DealerPaymentStats)
        }
      } catch (e: any) {
        console.error("Payment dashboard load error:", e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [search, status, method, page, mode, dealerId])

  async function handleRefund(paymentId: string) {
    if (!confirm("Refund this payment?")) return
    try {
      await refundPaymentAction(paymentId)
      load()
    } catch (e: any) {
      alert(e.message || "Refund failed")
    }
  }

  const totalPages = Math.ceil(count / limit) || 1
  const stats = mode === "admin" ? adminStats : dealerStats

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mode === "admin" && adminStats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currencyFormatter(adminStats.revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currencyFormatter(adminStats.todayRevenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Refunds</CardTitle>
                <RefreshCw className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.refunds}</div>
              </CardContent>
            </Card>
          </>
        ) : mode === "dealer" && dealerStats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currencyFormatter(dealerStats.sales)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dealerStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Settlements</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dealerStats.pendingSettlements}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Refunds</CardTitle>
                <XCircle className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dealerStats.refunds}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by order number, customer, dealer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1) }}>
            {methodOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {loading && payments.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-slate-500">
          <CreditCard className="mx-auto mb-2 h-8 w-8" />
          No payments found.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  {mode === "admin" && <th className="px-4 py-3 font-medium">Dealer</th>}
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{dateFormatter(p.created_at)}</td>
                    <td className="px-4 py-3 font-medium">
                      {p.order?.order_number || p.order_id}
                    </td>
                    {mode === "admin" && (
                      <td className="px-4 py-3 text-slate-600">
                        {p.order?.seller?.business_name || p.order?.seller?.name || "-"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-600">
                      {p.order?.buyer?.name || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">{currencyFormatter(p.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusColor(p.status)}>{p.status.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 uppercase">{p.payment_method || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.invoice_id && (
                          <Link
                            href={`/api/invoices/${p.invoice_id}/pdf`}
                            target="_blank"
                            className="inline-flex items-center text-xs text-blue-600 hover:underline"
                          >
                            <Download className="mr-1 h-3 w-3" /> Invoice
                          </Link>
                        )}
                        {mode === "admin" && p.status === "CAPTURED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600"
                            onClick={() => handleRefund(p.id)}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages} ({count} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
