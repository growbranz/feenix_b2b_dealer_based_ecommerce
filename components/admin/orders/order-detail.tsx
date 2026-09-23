"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import type { AdminOrder } from "@/lib/admin/orders-service"
import {
  getAdminOrderDetail,
  updateAdminOrderStatus,
  assignAdminOrderSeller,
  cancelAdminOrder,
  refundAdminOrder,
  uploadAdminOrderDocument,
} from "@/lib/admin/orders-service"
import { getAdminDealers, type AdminProfile } from "@/lib/admin/enquiries-service"
import { OrderStatus, orderStatusOptions, statusColor, paymentColor } from "@/lib/orders/data"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { User, Phone, Mail, Building2, MapPin, Package, Truck, FileText, RotateCcw, Ban, Users } from "lucide-react"

export function OrderDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [order, setOrder] = React.useState<AdminOrder | null>(null)
  const [dealers, setDealers] = React.useState<AdminProfile[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [assignOpen, setAssignOpen] = React.useState(false)
  const [selectedDealer, setSelectedDealer] = React.useState<string>("")
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [refundOpen, setRefundOpen] = React.useState(false)
  const [invoiceLabel, setInvoiceLabel] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  const loadOrder = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [orderData, dealerData] = await Promise.all([getAdminOrderDetail(id), getAdminDealers()])
      setOrder(orderData)
      setDealers(dealerData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadOrder()
  }, [loadOrder])

  React.useEffect(() => {
    if (order) setSelectedDealer(order.dealer?.id || "")
  }, [order])

  const handleStatusChange = async (status: string) => {
    if (!order) return
    setIsProcessing(true)
    try {
      await updateAdminOrderStatus(order.id, status)
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssign = async () => {
    if (!order || !selectedDealer) return
    setIsProcessing(true)
    try {
      await assignAdminOrderSeller(order.id, selectedDealer)
      setAssignOpen(false)
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign dealer")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    setIsProcessing(true)
    try {
      await cancelAdminOrder(order.id)
      setCancelOpen(false)
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRefund = async () => {
    if (!order) return
    setIsProcessing(true)
    try {
      await refundAdminOrder(order.id)
      setRefundOpen(false)
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refund order")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateInvoice = async () => {
    if (!order) return
    const name = invoiceLabel.trim() || `invoice-${order.order_number}.pdf`
    setIsProcessing(true)
    try {
      await uploadAdminOrderDocument(order.id, { type: "INVOICE", name })
      setInvoiceLabel("")
      await loadOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <p className="text-sm font-medium">Loading order...</p>
      </div>
    )
  }

  if (!order && !isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">Order not found</p>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={Ban}
        title="Failed to load order"
        description={error}
        action={<Button onClick={loadOrder} variant="outline">Retry</Button>}
      />
    )
  }

  if (!order) return null

  const customerAddress = [order.customer?.address, order.customer?.city, order.customer?.state]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{order.order_number}</h1>
          <p className="mt-1 text-sm text-slate-500">{dateFormatter(order.created_at, "long")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("text-xs capitalize", statusColor(order.status as OrderStatus))}>{order.status.toLowerCase()}</Badge>
          <Badge className={cn("text-xs capitalize", paymentColor(order.payment_status))}>{order.payment_status.toLowerCase()}</Badge>
          <FilterSelect value={order.status} onChange={(e) => handleStatusChange(e.target.value)} options={orderStatusOptions.filter((s) => s.value !== "all")} disabled={isProcessing} />
          <Button variant="outline" size="sm" onClick={() => setAssignOpen(true)} disabled={isProcessing}><Users className="mr-1 h-3 w-3" />Assign</Button>
          <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)} disabled={isProcessing}><Ban className="mr-1 h-3 w-3" />Cancel</Button>
          {order.payment_status === "COMPLETED" && <Button variant="outline" size="sm" onClick={() => setRefundOpen(true)} disabled={isProcessing}><RotateCcw className="mr-1 h-3 w-3" />Refund</Button>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Name" value={order.customer?.name || "—"} icon={User} />
            <Info label="Phone" value={order.customer?.phone || "—"} icon={Phone} />
            <Info label="Email" value={order.customer?.email || "—"} icon={Mail} />
            <Info label="Business" value={order.customer?.business_name || "—"} icon={Building2} />
            <Info label="Address" value={customerAddress || "—"} icon={MapPin} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Dealer</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Dealer" value={order.dealer?.business_name || order.dealer?.name || "—"} icon={User} />
            <Info label="Courier" value={order.courier || "—"} icon={Truck} />
            <Info label="Tracking" value={order.tracking_number || "—"} icon={Truck} />
            <Info label="Expected Delivery" value={order.expected_delivery ? dateFormatter(order.expected_delivery, "short") : "—"} icon={Package} />
            <Info label="Payment Method" value={order.payment_method || "—"} icon={FileText} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            <SummaryRow label="Subtotal" value={currencyFormatter(order.subtotal)} />
            <SummaryRow label="Tax" value={currencyFormatter(order.tax_total)} />
            <SummaryRow label="Discount" value={`- ${currencyFormatter(order.discount_total)}`} />
            <SummaryRow label="Shipping" value={currencyFormatter(order.shipping_charges)} />
            <div className="mt-2 border-t border-slate-100 pt-2">
              <SummaryRow label="Grand Total" value={currencyFormatter(order.grand_total)} className="text-base font-bold text-slate-900" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Products</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-2 text-left text-xs font-semibold uppercase text-slate-500">Product</th>
                  <th className="py-2 text-left text-xs font-semibold uppercase text-slate-500">Brand / Category</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Qty</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Unit Price</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Tax</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Discount</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 text-sm font-medium text-slate-900">{item.product_name}</td>
                    <td className="py-3 text-sm text-slate-600">{item.sku || "—"}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{currencyFormatter(item.unit_price)}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{currencyFormatter(item.tax)}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{currencyFormatter(item.discount)}</td>
                    <td className="py-3 text-right text-sm font-semibold text-slate-900">{currencyFormatter(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Status Timeline</CardTitle></CardHeader>
          <CardContent className="pt-0">
            {order.timeline.length === 0 ? (
              <p className="text-sm text-slate-500">No timeline events yet.</p>
            ) : (
              <ul className="space-y-4">
                {order.timeline.map((t) => (
                  <li key={t.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.status.toLowerCase()}</p>
                      {t.note && <p className="text-sm text-slate-600">{t.note}</p>}
                      <p className="text-xs text-slate-500">{t.actor} • {dateFormatter(t.timestamp, "long")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-0">
            {order.documents.length === 0 && <p className="text-sm text-slate-500">No documents.</p>}
            {order.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                <a href={doc.url || "#"} download>
                  <Button size="sm" variant="outline">Download</Button>
                </a>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={invoiceLabel} onChange={(e) => setInvoiceLabel(e.target.value)} placeholder="Invoice file name" />
              <Button onClick={handleGenerateInvoice} disabled={isProcessing}>{isProcessing ? "Uploading..." : "Generate Invoice"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminDrawer open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Dealer" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button onClick={handleAssign} disabled={isProcessing}>Assign</Button></div>}>
        <div className="space-y-4">
          {dealers.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealer === d.id} onCheckedChange={() => setSelectedDealer(d.id)} />
              <span className="text-sm font-medium text-slate-700">{d.business_name || d.name}</span>
            </label>
          ))}
        </div>
      </AdminDrawer>

      <ConfirmationDialog open={cancelOpen} onOpenChange={(open) => { if (!open) setCancelOpen(false) }} title="Cancel Order" description="Cancel this order?" confirmText="Cancel" onConfirm={handleCancel} variant="destructive" />
      <ConfirmationDialog open={refundOpen} onOpenChange={(open) => { if (!open) setRefundOpen(false) }} title="Refund Order" description="Refund and mark refunded?" confirmText="Refund" onConfirm={handleRefund} variant="destructive" />
    </div>
  )
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value || "—"}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-600">
      <span>{label}</span>
      <span className={className}>{value}</span>
    </div>
  )
}
