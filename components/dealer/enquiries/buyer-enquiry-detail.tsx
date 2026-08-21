"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import type { DealerEnquiryDetail as DealerEnquiryDetailType, EnquiryStatus } from "@/types/enquiries"
import { acceptBuyerQuotation, rejectBuyerQuotation } from "@/lib/enquiries/buyer-service"
import { currencyFormatter, dateFormatter, cn } from "@/lib/utils"
import {
  User,
  Phone,
  Mail,
  Package,
  Hash,
  Store,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  MessageSquare,
  FileSpreadsheet,
} from "lucide-react"

const statusStyles: Record<EnquiryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-blue-100 text-blue-700",
}

const statusIcons: Record<EnquiryStatus, React.ElementType> = {
  PENDING: Clock,
  ASSIGNED: Clock,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  COMPLETED: CheckCircle2,
}

interface BuyerEnquiryDetailProps {
  initialEnquiry: DealerEnquiryDetailType | null
  sellerName: string
  sellerBusinessName: string | null
  sellerEmail: string
  sellerPhone: string | null
}

export function BuyerEnquiryDetail({ 
  initialEnquiry, 
  sellerName,
  sellerBusinessName,
  sellerEmail,
  sellerPhone 
}: BuyerEnquiryDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [isAccepting, setIsAccepting] = React.useState(false)
  const [isRejecting, setIsRejecting] = React.useState(false)
  const [accepted, setAccepted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!initialEnquiry) {
    return (
      <EmptyState
        icon={Inbox}
        title="Enquiry not found"
        description="This enquiry doesn't exist, or you don't have access to it."
      />
    )
  }

  const enquiry = initialEnquiry
  const StatusIcon = statusIcons[enquiry.status]

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  async function handleAccept() {
    setIsAccepting(true)
    setError(null)
    try {
      await acceptBuyerQuotation(enquiry.id)
      setAccepted(true)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Failed to accept quotation")
    } finally {
      setIsAccepting(false)
    }
  }

  async function handleReject() {
    setIsRejecting(true)
    setError(null)
    try {
      await rejectBuyerQuotation(enquiry.id)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || "Failed to reject quotation")
    } finally {
      setIsRejecting(false)
    }
  }

  const lifecycleSteps = [
    { status: "PENDING", label: "Pending", icon: Clock },
    { status: "ASSIGNED", label: "Assigned", icon: Clock },
    { status: "ACCEPTED", label: "Accepted", icon: CheckCircle2 },
    { status: "REJECTED", label: "Rejected", icon: XCircle },
    { status: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  ]

  const currentStepIndex = lifecycleSteps.findIndex((step) => step.status === enquiry.status)
  const isRejected = enquiry.status === "REJECTED"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{enquiry.product.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{dateFormatter(enquiry.created_at, "long")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs capitalize", statusStyles[enquiry.status])}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {enquiry.status.toLowerCase()}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">{enquiry.priority.toLowerCase()} priority</Badge>
        </div>
      </div>

      <Button variant="outline" onClick={handleRefresh} disabled={isPending} className="h-8 w-fit rounded-xl px-3">
        <Clock className={cn("mr-2 h-4 w-4", isPending && "animate-spin")} />
        Refresh Status
      </Button>

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

      {/* Lifecycle Progress */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Enquiry Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative flex items-center justify-between">
            {/* Progress line background */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
            
            {lifecycleSteps.map((step, index) => {
              const StepIcon = step.icon
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              const isUpcoming = index > currentStepIndex

              return (
                <div key={step.status} className="flex flex-col items-center flex-1 relative">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 z-10",
                      isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                      isCurrent && "border-blue-500 bg-blue-500 text-white",
                      isUpcoming && "border-slate-300 bg-slate-100 text-slate-400"
                    )}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      isCompleted && "text-emerald-600",
                      isCurrent && "text-blue-600",
                      isUpcoming && "text-slate-400"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-4 w-4 text-slate-500" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Info label="Business Name" value={sellerBusinessName || sellerName} icon={Store} />
            <Info label="Contact Person" value={sellerName} icon={User} />
            <Info label="Email" value={sellerEmail} icon={Mail} />
            <Info label="Phone" value={sellerPhone || "—"} icon={Phone} />
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

      {enquiry.latestQuotation && (
        <Card className="rounded-2xl border-blue-200 bg-blue-50/30 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-800">
              <FileSpreadsheet className="h-4 w-4" />
              Quotation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {enquiry.latestQuotation.metadata?.price !== undefined && enquiry.latestQuotation.metadata?.price !== null && (
              <Info label="Quoted Price" value={currencyFormatter(Number(enquiry.latestQuotation.metadata.price))} icon={Hash} />
            )}
            {enquiry.latestQuotation.metadata?.delivery_days !== undefined && enquiry.latestQuotation.metadata?.delivery_days !== null && (
              <Info label="Delivery Days" value={`${enquiry.latestQuotation.metadata.delivery_days} days`} icon={Calendar} />
            )}
            {enquiry.latestQuotation.metadata?.warranty && (
              <Info label="Warranty" value={enquiry.latestQuotation.metadata.warranty} icon={CheckCircle2} />
            )}
            {enquiry.latestQuotation.metadata?.remarks && (
              <Info label="Remarks" value={enquiry.latestQuotation.metadata.remarks} icon={Hash} />
            )}
            <Info label="Quotation Sent" value={dateFormatter(enquiry.latestQuotation.created_at, "long")} icon={Calendar} />
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {enquiry.timeline.length === 0 ? (
            <p className="text-sm text-slate-500">No timeline events yet.</p>
          ) : (
            <ul className="space-y-4">
              {enquiry.timeline.map((t) => {
                const TimelineIcon = statusIcons[t.status] || Clock
                return (
                  <li key={t.id} className="flex gap-3">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      <TimelineIcon className="h-4 w-4 text-slate-500" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 capitalize">{t.status.toLowerCase()}</p>
                      {t.note && <p className="text-sm text-slate-600">{t.note}</p>}
                      <p className="text-xs text-slate-500">{t.actor} • {dateFormatter(t.timestamp, "long")}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-2">
            <Link href={enquiry.conversationId ? `/dealer/messages?conversation=${enquiry.conversationId}` : `/dealer/messages?enquiry=${enquiry.id}`}>
              <Button variant="outline" disabled={isPending || !enquiry.conversationId}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Open Chat
              </Button>
            </Link>
            {enquiry.order && (
              <Link href={`/dealer/orders/${enquiry.order.id}`}>
                <Button variant="outline" disabled={isPending}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View Order
                </Button>
              </Link>
            )}
            {enquiry.latestQuotation && !enquiry.order && enquiry.status === "ACCEPTED" && !accepted && (
              <>
                <Button onClick={handleAccept} disabled={isAccepting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isAccepting ? "Accepting..." : "Accept Quotation"}
                </Button>
                <Button onClick={handleReject} disabled={isRejecting} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  {isRejecting ? "Rejecting..." : "Reject Quotation"}
                </Button>
              </>
            )}
            {accepted && (
              <Badge className="bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Quotation accepted
              </Badge>
            )}
            {error && <p className="w-full text-sm text-red-600">{error}</p>}
          </div>
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