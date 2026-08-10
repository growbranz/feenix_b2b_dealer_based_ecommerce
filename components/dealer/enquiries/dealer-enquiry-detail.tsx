"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import type { DealerEnquiryDetail as DealerEnquiryDetailType, EnquiryStatus } from "@/types/enquiries"
import {
  createOrderFromEnquiry,
  getOrCreateEnquiryConversation,
  sendEnquiryQuotation,
  updateDealerEnquiryStatus,
} from "@/lib/enquiries/dealer-service"
import { currencyFormatter, dateFormatter, cn } from "@/lib/utils"
import {
  User,
  Phone,
  Mail,
  Package,
  Hash,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
  ShoppingCart,
  Inbox,
} from "lucide-react"

const statusStyles: Record<EnquiryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-blue-100 text-blue-700",
}

interface DealerEnquiryDetailProps {
  initialEnquiry: DealerEnquiryDetailType | null
}

export function DealerEnquiryDetail({ initialEnquiry }: DealerEnquiryDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [error, setError] = React.useState<string | null>(null)

  const [price, setPrice] = React.useState("")
  const [deliveryDays, setDeliveryDays] = React.useState("")
  const [warranty, setWarranty] = React.useState("")
  const [remarks, setRemarks] = React.useState("")
  const [activeForm, setActiveForm] = React.useState<"quote" | null>(null)

  if (!initialEnquiry) {
    return (
      <EmptyState
        icon={Inbox}
        title="Enquiry not found"
        description="This enquiry doesn't exist, or it isn't assigned to you."
      />
    )
  }

  const enquiry = initialEnquiry

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

  const handleAccept = () => runAction(() => updateDealerEnquiryStatus(enquiry.id, "ACCEPTED"))
  const handleReject = () => runAction(() => updateDealerEnquiryStatus(enquiry.id, "REJECTED"))
  const handleCreateOrder = () => runAction(() => createOrderFromEnquiry(enquiry.id))

  const handleOpenChat = () =>
    runAction(async () => {
      const conversation = await getOrCreateEnquiryConversation(enquiry.id)
      router.push(`/dealer/messages?conversation=${conversation.id}`)
    })

  const handleSendQuote = () =>
    runAction(
      () =>
        sendEnquiryQuotation(enquiry.id, {
          price: price ? Number(price) : null,
          deliveryDays: deliveryDays ? Number(deliveryDays) : null,
          warranty: warranty || undefined,
          remarks: remarks || undefined,
        }),
      () => {
        setPrice("")
        setDeliveryDays("")
        setWarranty("")
        setRemarks("")
        setActiveForm(null)
      }
    )

  const canDecide = enquiry.status === "PENDING" || enquiry.status === "ASSIGNED"
  const canCreateOrder = enquiry.status === "ACCEPTED" && !enquiry.order

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{enquiry.product.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{dateFormatter(enquiry.created_at, "long")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs capitalize", statusStyles[enquiry.status])}>{enquiry.status.toLowerCase()}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{enquiry.priority.toLowerCase()} priority</Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {enquiry.order && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>
            This enquiry was converted to order <span className="font-semibold">{enquiry.order.order_number}</span>
          </span>
          <Link href={`/dealer/orders/${enquiry.order.id}`}>
            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-100">
              View Order
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Name" value={enquiry.buyer.business_name || enquiry.buyer.name} icon={User} />
            <Info label="Phone" value={enquiry.buyer.phone || "—"} icon={Phone} />
            <Info label="Email" value={enquiry.buyer.email} icon={Mail} />
            <Info
              label="Location"
              value={[enquiry.buyer.city, enquiry.buyer.state].filter(Boolean).join(", ") || "—"}
              icon={User}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-500" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Product" value={enquiry.product.title} icon={Package} />
            <Info label="Brand" value={enquiry.product.brand || "—"} icon={Hash} />
            <Info label="Category" value={enquiry.product.category || "—"} icon={Hash} />
            <Info label="Model" value={enquiry.product.model || "—"} icon={Hash} />
            <Info label="Quantity" value={enquiry.quantity.toString()} icon={Hash} />
            <Info label="Listed Price" value={currencyFormatter(enquiry.product.price)} icon={Hash} />
            <Info label="Remarks" value={enquiry.remarks || "—"} icon={Hash} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Actions</CardTitle></CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-2">
            {canDecide && (
              <>
                <Button onClick={handleAccept} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Accept
                </Button>
                <Button onClick={handleReject} disabled={isPending} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleOpenChat} disabled={isPending}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Open Chat
            </Button>
            <Button variant="outline" onClick={() => setActiveForm("quote")} disabled={isPending}>
              <Send className="mr-2 h-4 w-4" />
              Send Quotation
            </Button>
            {canCreateOrder && (
              <Button onClick={handleCreateOrder} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            )}
          </div>

          {activeForm === "quote" && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Price (per unit)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                <div className="space-y-2"><Label>Delivery (days)</Label><Input type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} /></div>
                <div className="space-y-2"><Label>Warranty</Label><Input value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 3 months" /></div>
              </div>
              <div className="space-y-2"><Label>Remarks</Label><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Additional notes for the buyer..." /></div>
              <Button onClick={handleSendQuote} disabled={isPending}>Send Quotation</Button>
              <p className="text-xs text-slate-500">Sent as a message in your chat with the buyer.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold">Timeline</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {enquiry.timeline.length === 0 ? (
            <p className="text-sm text-slate-500">No timeline events yet.</p>
          ) : (
            <ul className="space-y-4">
              {enquiry.timeline.map((t) => (
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
