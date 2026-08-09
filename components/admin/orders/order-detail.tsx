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
import { mockOrders, Order, OrderStatus, dealerOptions, orderStatusOptions, statusColor, paymentColor } from "@/lib/orders/data"
import { dateFormatter } from "@/lib/utils"
import { User, Phone, Mail, Building2, MapPin, Package, Truck, FileText, RotateCcw, Ban, Users } from "lucide-react"

export function OrderDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [order, setOrder] = React.useState<Order | null>(() => mockOrders.find((o) => o.id === id) || null)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [selectedDealer, setSelectedDealer] = React.useState<string>("")
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [refundOpen, setRefundOpen] = React.useState(false)
  const [invoiceLabel, setInvoiceLabel] = React.useState("")

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">Order not found</p>
      </div>
    )
  }

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`

  const addTimeline = (status: OrderStatus, actor = "Admin", note?: string) => {
    const now = new Date().toISOString()
    setOrder((o) =>
      o ? { ...o, status, timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status, actor, timestamp: now, note }], updated_at: now } : null
    )
  }

  const handleStatusChange = (status: OrderStatus) => {
    addTimeline(status, "Admin", `Status overridden to ${status}`)
  }

  const handleAssign = () => {
    const dealer = dealerOptions.find((d) => d.id === selectedDealer)
    if (!dealer) return
    setOrder((o) =>
      o
        ? {
            ...o,
            dealer: { id: dealer.id, name: dealer.name },
            timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status: o.status, actor: "Admin", timestamp: new Date().toISOString(), note: `Assigned to ${dealer.name}` }],
            updated_at: new Date().toISOString(),
          }
        : null
    )
    setAssignOpen(false)
  }

  const handleCancel = () => {
    addTimeline("CANCELLED", "Admin", "Order cancelled")
    setCancelOpen(false)
  }

  const handleRefund = () => {
    const now = new Date().toISOString()
    setOrder((o) =>
      o
        ? {
            ...o,
            status: "REFUNDED",
            payment_status: "REFUNDED",
            timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status: "REFUNDED", actor: "Admin", timestamp: now, note: "Order refunded" }],
            updated_at: now,
          }
        : null
    )
    setRefundOpen(false)
  }

  const handleGenerateInvoice = () => {
    const now = new Date().toISOString()
    const name = invoiceLabel.trim() || `invoice-${order.id}.pdf`
    setOrder((o) =>
      o
        ? {
            ...o,
            documents: [...o.documents, { id: Math.random().toString(36).slice(2), type: "INVOICE", name, url: "#", uploaded_at: now }],
            updated_at: now,
          }
        : null
    )
    setInvoiceLabel("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{dateFormatter(order.created_at, "long")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`text-xs capitalize ${statusColor(order.status)}`}>{order.status.toLowerCase()}</Badge>
          <Badge className={`text-xs capitalize ${paymentColor(order.payment_status)}`}>{order.payment_status.toLowerCase()}</Badge>
          <FilterSelect value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)} options={orderStatusOptions.filter((s) => s.value !== "all")} />
          <Button variant="outline" size="sm" onClick={() => { setSelectedDealer(order.dealer.id); setAssignOpen(true) }}><Users className="mr-1 h-3 w-3" />Assign</Button>
          <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}><Ban className="mr-1 h-3 w-3" />Cancel</Button>
          {order.payment_status === "COMPLETED" && <Button variant="outline" size="sm" onClick={() => setRefundOpen(true)}><RotateCcw className="mr-1 h-3 w-3" />Refund</Button>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Name" value={order.customer.name} icon={User} />
            <Info label="Phone" value={order.customer.phone} icon={Phone} />
            <Info label="Email" value={order.customer.email} icon={Mail} />
            <Info label="Business" value={order.customer.business} icon={Building2} />
            <Info label="Address" value={`${order.customer.address}, ${order.customer.city}, ${order.customer.state}`} icon={MapPin} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Dealer</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Dealer" value={order.dealer.name} icon={User} />
            <Info label="Courier" value={order.courier || "—"} icon={Truck} />
            <Info label="Tracking" value={order.tracking_number || "—"} icon={Truck} />
            <Info label="Expected Delivery" value={order.expected_delivery ? dateFormatter(order.expected_delivery, "short") : "—"} icon={Package} />
            <Info label="Payment Method" value={order.payment_method} icon={FileText} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal)} />
            <SummaryRow label="Tax" value={formatCurrency(order.tax_total)} />
            <SummaryRow label="Discount" value={`- ${formatCurrency(order.discount_total)}`} />
            <SummaryRow label="Shipping" value={formatCurrency(order.shipping_charges)} />
            <div className="mt-2 border-t border-slate-100 pt-2">
              <SummaryRow label="Grand Total" value={formatCurrency(order.grand_total)} className="text-base font-bold text-slate-900" />
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
                    <td className="py-3 text-sm text-slate-600">{item.brand} / {item.category}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{formatCurrency(item.tax)}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{formatCurrency(item.discount)}</td>
                    <td className="py-3 text-right text-sm font-semibold text-slate-900">{formatCurrency(item.quantity * (item.unit_price + item.tax - item.discount))}</td>
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
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-0">
            {order.documents.length === 0 && <p className="text-sm text-slate-500">No documents.</p>}
            {order.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                <a href={doc.url} download>
                  <Button size="sm" variant="outline">Download</Button>
                </a>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={invoiceLabel} onChange={(e) => setInvoiceLabel(e.target.value)} placeholder="Invoice file name" />
              <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AdminDrawer open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Dealer" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button onClick={handleAssign}>Assign</Button></div>}>
        <div className="space-y-4">
          {dealerOptions.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealer === d.id} onCheckedChange={() => setSelectedDealer(d.id)} />
              <span className="text-sm font-medium text-slate-700">{d.name}</span>
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
