"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { mockOrders, Order, OrderStatus, orderStatusOptions, statusColor, paymentColor } from "@/lib/orders/data"
import { dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { User, Phone, Mail, MapPin, Truck, CheckCircle2, XCircle, UploadCloud, ArrowUp } from "lucide-react"

const CURRENT_DEALER_ID = "2"

export function DealerOrderDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [order, setOrder] = React.useState<Order | null>(() => {
    const o = mockOrders.find((o) => o.id === id && o.dealer.id === CURRENT_DEALER_ID)
    return o || null
  })

  const [status, setStatus] = React.useState<OrderStatus>("PACKED")
  const [courier, setCourier] = React.useState("")
  const [tracking, setTracking] = React.useState("")
  const [expected, setExpected] = React.useState("")
  const [docName, setDocName] = React.useState("")
  const [active, setActive] = React.useState<"status" | "dispatch" | "invoice" | null>(null)

  if (!order) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">Order not found or not assigned</p>
      </div>
    )
  }

  const formatCurrency = (n: number) => `₹${n.toLocaleString("en-IN")}`

  const addTimeline = (newStatus: OrderStatus, note?: string) => {
    const now = new Date().toISOString()
    setOrder((o) =>
      o
        ? { ...o, status: newStatus, timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status: newStatus, actor: "Dealer", timestamp: now, note }], updated_at: now }
        : null
    )
  }

  const handleConfirm = () => addTimeline("CONFIRMED", "Dealer confirmed order")
  const handleReject = () => addTimeline("CANCELLED", "Dealer rejected order")
  const handleUpdateStatus = () => addTimeline(status, `Status updated to ${status}`)

  const handleDispatch = () => {
    const now = new Date().toISOString()
    setOrder((o) =>
      o
        ? {
            ...o,
            status: "SHIPPED",
            courier,
            tracking_number: tracking,
            expected_delivery: expected,
            documents: [...o.documents, { id: Math.random().toString(36).slice(2), type: "DISPATCH", name: docName.trim() || "dispatch-note.pdf", url: "#", uploaded_at: now }],
            timeline: [...o.timeline, { id: Math.random().toString(36).slice(2), status: "SHIPPED", actor: "Dealer", timestamp: now, note: `Shipped via ${courier}, tracking ${tracking}` }],
            updated_at: now,
          }
        : null
    )
    setCourier("")
    setTracking("")
    setExpected("")
    setDocName("")
    setActive(null)
  }

  const handleInvoiceUpload = () => {
    const now = new Date().toISOString()
    setOrder((o) =>
      o
        ? {
            ...o,
            documents: [...o.documents, { id: Math.random().toString(36).slice(2), type: "INVOICE", name: docName.trim() || "invoice.pdf", url: "#", uploaded_at: now }],
            updated_at: now,
          }
        : null
    )
    setDocName("")
    setActive(null)
  }

  const isShippedOrBeyond = ["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{order.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{dateFormatter(order.created_at, "long")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs capitalize", statusColor(order.status))}>{order.status.toLowerCase()}</Badge>
          <Badge className={cn("text-xs capitalize", paymentColor(order.payment_status))}>{order.payment_status.toLowerCase()}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Name" value={order.customer.name} icon={User} />
            <Info label="Phone" value={order.customer.phone} icon={Phone} />
            <Info label="Email" value={order.customer.email} icon={Mail} />
            <Info label="Address" value={`${order.customer.address}, ${order.customer.city}, ${order.customer.state}`} icon={MapPin} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span className="font-medium text-slate-900">{formatCurrency(order.tax_total)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span className="font-medium text-slate-900">-{formatCurrency(order.discount_total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="font-medium text-slate-900">{formatCurrency(order.shipping_charges)}</span></div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900"><span>Grand Total</span><span>{formatCurrency(order.grand_total)}</span></div>
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
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-3 text-sm font-medium text-slate-900">{item.product_name}</td>
                    <td className="py-3 text-sm text-slate-600">{item.brand} / {item.category}</td>
                    <td className="py-3 text-right text-sm text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right text-sm font-semibold text-slate-900">{formatCurrency(item.quantity * (item.unit_price + item.tax - item.discount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Actions</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {order.status === "PENDING" && (
              <>
                <Button onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-2 h-4 w-4" />Confirm</Button>
                <Button onClick={handleReject} variant="destructive"><XCircle className="mr-2 h-4 w-4" />Reject</Button>
              </>
            )}
            <Button variant="outline" onClick={() => setActive("status")}><ArrowUp className="mr-2 h-4 w-4" />Update Status</Button>
            <Button variant="outline" onClick={() => setActive("dispatch")} disabled={isShippedOrBeyond}><Truck className="mr-2 h-4 w-4" />Dispatch</Button>
            <Button variant="outline" onClick={() => setActive("invoice")}><UploadCloud className="mr-2 h-4 w-4" />Upload Invoice</Button>
          </div>

          {active === "status" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <FilterSelect value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} options={orderStatusOptions.filter((s) => s.value !== "all")} />
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          )}

          {active === "dispatch" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Courier Name</Label><Input value={courier} onChange={(e) => setCourier(e.target.value)} /></div>
                <div className="space-y-2"><Label>Tracking Number</Label><Input value={tracking} onChange={(e) => setTracking(e.target.value)} /></div>
                <div className="space-y-2"><Label>Expected Delivery</Label><Input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></div>
                <div className="space-y-2"><Label>Document Name</Label><Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="dispatch-note.pdf" /></div>
              </div>
              <Button onClick={handleDispatch}>Mark Shipped</Button>
            </div>
          )}

          {active === "invoice" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="invoice.pdf" />
              <Button onClick={handleInvoiceUpload}>Upload Invoice</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Timeline</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-4">
            {order.timeline.map((t) => (
              <li key={t.id} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">{t.status.toLowerCase()}</p>
                  {t.note && <p className="text-sm text-slate-600">{t.note}</p>}
                  <p className="text-xs text-slate-500">{t.actor} • {dateFormatter(t.timestamp, "long")}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
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
