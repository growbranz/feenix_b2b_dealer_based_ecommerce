"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { EmptyState } from "@/components/shared/empty-state"
import { OrderStatus, orderStatusOptions, statusColor, paymentColor } from "@/lib/orders/data"
import type { DealerOrderDetail as DealerOrderDetailType } from "@/types/orders"
import {
  dispatchDealerOrder,
  updateDealerOrderStatus,
  uploadDealerOrderDocument,
} from "@/lib/orders/dealer-service"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  UploadCloud,
  ArrowUp,
  PackageX,
  FileText,
} from "lucide-react"

interface DealerOrderDetailProps {
  initialOrder: DealerOrderDetailType | null
}

export function DealerOrderDetail({ initialOrder }: DealerOrderDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const [status, setStatus] = React.useState<OrderStatus>("PACKED")
  const [courier, setCourier] = React.useState("")
  const [tracking, setTracking] = React.useState("")
  const [expected, setExpected] = React.useState("")
  const [docName, setDocName] = React.useState("")
  const [active, setActive] = React.useState<"status" | "dispatch" | "invoice" | null>(null)

  if (!initialOrder) {
    return (
      <EmptyState
        icon={PackageX}
        title="Order not found"
        description="This order doesn't exist, or it isn't assigned to you."
      />
    )
  }

  const order = initialOrder

  function runAction(action: () => Promise<unknown>, onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      try {
        await action()
        onSuccess?.()
        router.refresh()
      } catch (e: any) {
        setError(e?.message || "Something went wrong. Please try again.")
      }
    })
  }

  const handleConfirm = () => runAction(() => updateDealerOrderStatus(order.id, "CONFIRMED"))
  const handleReject = () => runAction(() => updateDealerOrderStatus(order.id, "CANCELLED"))
  const handleUpdateStatus = () => runAction(() => updateDealerOrderStatus(order.id, status))

  const handleDispatch = () =>
    runAction(
      () =>
        dispatchDealerOrder(order.id, {
          courier,
          trackingNumber: tracking,
          expectedDelivery: expected || undefined,
          documentName: docName,
        }),
      () => {
        setCourier("")
        setTracking("")
        setExpected("")
        setDocName("")
        setActive(null)
      }
    )

  const handleInvoiceUpload = () =>
    runAction(
      () => uploadDealerOrderDocument(order.id, { type: "INVOICE", name: docName || "invoice.pdf" }),
      () => {
        setDocName("")
        setActive(null)
      }
    )

  const isShippedOrBeyond = ["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{order.order_number}</h1>
          <p className="mt-1 text-sm text-slate-500">{dateFormatter(order.created_at, "long")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs capitalize", statusColor(order.status))}>{order.status.toLowerCase()}</Badge>
          <Badge className={cn("text-xs capitalize", paymentColor(order.payment_status))}>{order.payment_status.toLowerCase()}</Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Name" value={order.customer.business_name || order.customer.name} icon={User} />
            <Info label="Phone" value={order.customer.phone || "—"} icon={Phone} />
            <Info label="Email" value={order.customer.email} icon={Mail} />
            <Info
              label="Address"
              value={[order.customer.address, order.customer.city, order.customer.state].filter(Boolean).join(", ") || "—"}
              icon={MapPin}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-slate-900">{currencyFormatter(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span className="font-medium text-slate-900">{currencyFormatter(order.tax_total)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span className="font-medium text-slate-900">-{currencyFormatter(order.discount_total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="font-medium text-slate-900">{currencyFormatter(order.shipping_charges)}</span></div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900"><span>Grand Total</span><span>{currencyFormatter(order.grand_total)}</span></div>
            {(order.payment_method || order.courier) && (
              <div className="mt-2 space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
                {order.payment_method && <p>Payment method: <span className="font-medium text-slate-700">{order.payment_method}</span></p>}
                {order.courier && (
                  <p>
                    Courier: <span className="font-medium text-slate-700">{order.courier}</span>
                    {order.tracking_number && <> · Tracking: <span className="font-medium text-slate-700">{order.tracking_number}</span></>}
                  </p>
                )}
                {order.expected_delivery && <p>Expected delivery: <span className="font-medium text-slate-700">{dateFormatter(order.expected_delivery, "short")}</span></p>}
              </div>
            )}
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
                  <th className="py-2 text-left text-xs font-semibold uppercase text-slate-500">SKU</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Qty</th>
                  <th className="py-2 text-right text-xs font-semibold uppercase text-slate-500">Unit Price</th>
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
                    <td className="py-3 text-right text-sm font-semibold text-slate-900">{currencyFormatter(item.total)}</td>
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
                <Button onClick={handleConfirm} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-2 h-4 w-4" />Confirm</Button>
                <Button onClick={handleReject} disabled={isPending} variant="destructive"><XCircle className="mr-2 h-4 w-4" />Reject</Button>
              </>
            )}
            <Button variant="outline" onClick={() => setActive("status")} disabled={isPending}><ArrowUp className="mr-2 h-4 w-4" />Update Status</Button>
            <Button variant="outline" onClick={() => setActive("dispatch")} disabled={isPending || isShippedOrBeyond}><Truck className="mr-2 h-4 w-4" />Dispatch</Button>
            <Button variant="outline" onClick={() => setActive("invoice")} disabled={isPending}><UploadCloud className="mr-2 h-4 w-4" />Upload Invoice</Button>
          </div>

          {active === "status" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <FilterSelect value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} options={orderStatusOptions.filter((s) => s.value !== "all")} />
              <Button onClick={handleUpdateStatus} disabled={isPending}>Update Status</Button>
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
              <Button onClick={handleDispatch} disabled={isPending || !courier || !tracking}>Mark Shipped</Button>
            </div>
          )}

          {active === "invoice" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="invoice.pdf" />
              <Button onClick={handleInvoiceUpload} disabled={isPending}>Upload Invoice</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Documents</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {order.documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-3">
              {order.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.type} · {dateFormatter(doc.created_at, "long")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Timeline</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {order.timeline.length === 0 ? (
            <p className="text-sm text-slate-500">No timeline events yet.</p>
          ) : (
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
          )}
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
