"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockEnquiries, Enquiry, EnquiryStatus, DealerResponseStatus } from "@/lib/enquiry/data"
import { cn } from "@/lib/utils"
import { User, Phone, Mail, Package, Hash, CheckCircle2, XCircle, HelpCircle, Send } from "lucide-react"

const CURRENT_DEALER_ID = "2"
const CURRENT_DEALER_NAME = "MobileSpares Inc."

const statusStyles: Record<EnquiryStatus | DealerResponseStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  QUOTED: "bg-amber-100 text-amber-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-slate-100 text-slate-700",
  PENDING: "bg-slate-100 text-slate-700",
  CLARIFICATION: "bg-blue-100 text-blue-700",
}

export function DealerEnquiryDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [enquiry, setEnquiry] = React.useState<Enquiry | null>(() => {
    const e = mockEnquiries.find((e) => e.id === id && e.assigned_dealer_ids.includes(CURRENT_DEALER_ID))
    return e || null
  })

  const [price, setPrice] = React.useState("")
  const [deliveryDays, setDeliveryDays] = React.useState("")
  const [warranty, setWarranty] = React.useState("")
  const [remarks, setRemarks] = React.useState("")
  const [activeForm, setActiveForm] = React.useState<"quote" | "clarify" | null>(null)

  if (!enquiry) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">Enquiry not found or not assigned</p>
      </div>
    )
  }

  const addResponse = (responseStatus: DealerResponseStatus, fields: { price?: number | null; delivery_days?: number | null; warranty?: string; remarks?: string }) => {
    const now = new Date().toISOString()
    let nextStatus: EnquiryStatus = enquiry.status
    if (responseStatus === "ACCEPTED") nextStatus = "ACCEPTED"
    else if (responseStatus === "REJECTED") nextStatus = "REJECTED"
    else if (responseStatus === "QUOTED") nextStatus = "QUOTED"
    else if (responseStatus === "CLARIFICATION") nextStatus = "ASSIGNED"

    setEnquiry((e) =>
      e
        ? {
            ...e,
            status: nextStatus,
            responses: [
              ...e.responses,
              {
                id: Math.random().toString(36).slice(2),
                dealer_id: CURRENT_DEALER_ID,
                dealer_name: CURRENT_DEALER_NAME,
                status: responseStatus,
                ...fields,
                created_at: now,
              },
            ],
            timeline: [
              ...e.timeline,
              { id: Math.random().toString(36).slice(2), action: `${CURRENT_DEALER_NAME} ${responseStatus.toLowerCase()}`, actor: CURRENT_DEALER_NAME, timestamp: now },
            ],
            updated_at: now,
          }
        : null
    )
    setPrice("")
    setDeliveryDays("")
    setWarranty("")
    setRemarks("")
    setActiveForm(null)
  }

  const handleAccept = () => addResponse("ACCEPTED", { remarks: remarks || undefined })
  const handleReject = () => addResponse("REJECTED", { remarks: remarks || undefined })
  const handleClarification = () => addResponse("CLARIFICATION", { remarks: remarks || undefined })
  const handleQuote = () => {
    const p = price ? Number(price) : null
    const d = deliveryDays ? Number(deliveryDays) : null
    addResponse("QUOTED", { price: p, delivery_days: d, warranty: warranty || undefined, remarks: remarks || undefined })
  }

  const existingResponse = enquiry.responses.find((r) => r.dealer_id === CURRENT_DEALER_ID)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{enquiry.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{enquiry.product_name}</p>
        </div>
        <Badge className={cn("text-xs capitalize", statusStyles[enquiry.status])}>{enquiry.status.toLowerCase()}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Name" value={enquiry.customer_name} icon={User} />
            <Info label="Phone" value={enquiry.phone} icon={Phone} />
            <Info label="Email" value={enquiry.email} icon={Mail} />
            <Info label="Business" value={enquiry.business_name} icon={User} />
            <Info label="City" value={`${enquiry.city}, ${enquiry.state}`} icon={User} />
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
            <Info label="Product" value={enquiry.product_name} icon={Package} />
            <Info label="Brand" value={enquiry.brand_name} icon={Hash} />
            <Info label="Category" value={enquiry.category_name} icon={Hash} />
            <Info label="Model" value={enquiry.model_name} icon={Hash} />
            <Info label="Quantity" value={enquiry.quantity.toString()} icon={Hash} />
            <Info label="Condition" value={enquiry.preferred_condition} icon={Hash} />
            <Info label="Priority" value={enquiry.priority} icon={Hash} />
            <Info label="Message" value={enquiry.message} icon={Hash} />
          </CardContent>
        </Card>
      </div>

      {existingResponse && (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Your Response</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Badge className={cn("text-xs capitalize", statusStyles[existingResponse.status])}>{existingResponse.status.toLowerCase()}</Badge>
            {existingResponse.price !== null && existingResponse.price !== undefined && <p className="mt-2 text-sm text-slate-700">Price: ₹{existingResponse.price}</p>}
            {existingResponse.delivery_days && <p className="text-sm text-slate-700">Delivery: {existingResponse.delivery_days} days</p>}
            {existingResponse.warranty && <p className="text-sm text-slate-700">Warranty: {existingResponse.warranty}</p>}
            {existingResponse.remarks && <p className="text-sm text-slate-600">{existingResponse.remarks}</p>}
          </CardContent>
        </Card>
      )}

      {!existingResponse && (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAccept} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button onClick={handleReject} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button variant="outline" onClick={() => setActiveForm("clarify")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Request Clarification
              </Button>
              <Button variant="outline" onClick={() => setActiveForm("quote")}>
                <Send className="mr-2 h-4 w-4" />
                Add Quotation
              </Button>
            </div>

            {activeForm === "quote" && (
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Delivery (days)</Label>
                    <Input type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty</Label>
                    <Input value={warranty} onChange={(e) => setWarranty(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                <Button onClick={handleQuote}>Submit Quotation</Button>
              </div>
            )}

            {activeForm === "clarify" && (
              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <div className="space-y-2">
                  <Label>Clarification Request</Label>
                  <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                <Button onClick={handleClarification}>Request Clarification</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
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
