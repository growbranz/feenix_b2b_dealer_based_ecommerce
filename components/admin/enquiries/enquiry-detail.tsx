"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import {
  AdminEnquiry,
  getAdminEnquiryDetail,
  getAdminDealers,
  updateEnquiryStatus,
  assignEnquirySeller,
  addEnquiryNote,
} from "@/lib/admin/enquiries-service"
import { statusOptions } from "@/lib/enquiry/data"
import { currencyFormatter, dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { User, Phone, Mail, MapPin, Building2, Package, Hash, Clock, FileText, StickyNote, Inbox } from "lucide-react"
import type { EnquiryStatus } from "@/lib/enquiry/data"

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  QUOTED: "bg-amber-100 text-amber-700",
}

export function EnquiryDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [enquiry, setEnquiry] = React.useState<AdminEnquiry | null>(null)
  const [dealers, setDealers] = React.useState<{ id: string; business_name: string | null; name: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [selectedDealers, setSelectedDealers] = React.useState<string[]>([])

  const loadEnquiry = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [data, dealerList] = await Promise.all([getAdminEnquiryDetail(id), getAdminDealers()])
      setEnquiry(data)
      setDealers(dealerList)
      setSelectedDealers(data ? [data.seller?.id].filter(Boolean) as string[] : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enquiry")
    } finally {
      setIsLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadEnquiry()
  }, [loadEnquiry])

  const handleStatusChange = async (newStatus: EnquiryStatus) => {
    if (!enquiry) return
    try {
      await updateEnquiryStatus(enquiry.id, newStatus)
      await loadEnquiry()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  const handleAddNote = async () => {
    if (!enquiry || !note.trim()) return
    try {
      await addEnquiryNote(enquiry.id, note.trim())
      setNote("")
      await loadEnquiry()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note")
    }
  }

  const openAssign = () => {
    if (!enquiry) return
    setSelectedDealers([enquiry.seller?.id].filter(Boolean) as string[])
    setAssignOpen(true)
  }

  const handleAssign = async () => {
    if (!enquiry) return
    try {
      const sellerId = selectedDealers[0] || null
      await assignEnquirySeller(enquiry.id, sellerId)
      setAssignOpen(false)
      await loadEnquiry()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign dealer")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <p className="text-sm font-medium">Loading enquiry...</p>
      </div>
    )
  }

  if (!enquiry) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">Enquiry not found</p>
      </div>
    )
  }

  const buyerName = enquiry.buyer?.business_name || enquiry.buyer?.name || "—"
  const notes = enquiry.timeline.filter((t) => t.note)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{enquiry.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{enquiry.product?.title || "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn("text-xs capitalize", statusStyles[enquiry.status])}>{enquiry.status.toLowerCase()}</Badge>
          <FilterSelect
            value={enquiry.status}
            onChange={(e) => handleStatusChange(e.target.value as EnquiryStatus)}
            options={statusOptions.filter((o) => o.value !== "all")}
          />
          <Button onClick={openAssign}>Assign</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            <Info label="Name" value={enquiry.buyer?.name || "—"} icon={User} />
            <Info label="Phone" value={enquiry.buyer?.phone || "—"} icon={Phone} />
            <Info label="Email" value={enquiry.buyer?.email || "—"} icon={Mail} />
            <Info label="Business" value={buyerName} icon={Building2} />
            <Info label="City" value={enquiry.buyer?.city || "—"} icon={MapPin} />
            <Info label="State" value={enquiry.buyer?.state || "—"} icon={MapPin} />
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
            <Info label="Product" value={enquiry.product?.title || "—"} icon={Package} />
            <Info label="Brand" value={enquiry.product?.brand || "—"} icon={Hash} />
            <Info label="Category" value={enquiry.product?.category || "—"} icon={Hash} />
            <Info label="Model" value={enquiry.product?.model || "—"} icon={Hash} />
            <Info label="Quantity" value={enquiry.quantity.toString()} icon={Hash} />
            <Info label="Condition" value="—" icon={Clock} />
            <Info label="Priority" value={enquiry.priority} icon={Clock} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            Message
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-slate-700">
          <p>{enquiry.remarks || "—"}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Timeline & Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-4">
              {enquiry.timeline.length === 0 ? (
                <p className="text-sm text-slate-500">No activity recorded.</p>
              ) : (
                enquiry.timeline.map((t) => (
                  <li key={t.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">{t.status.toLowerCase()}</p>
                      {t.note && <p className="text-sm text-slate-600">{t.note}</p>}
                      <p className="text-xs text-slate-500">{t.actor} • {dateFormatter(t.timestamp, "long")}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-slate-500" />
              Internal Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {notes.length === 0 ? <p className="text-sm text-slate-500">No notes.</p> : null}
            {notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-900">{n.actor}</p>
                <p className="mt-1 text-slate-700">{n.note}</p>
                <p className="mt-2 text-xs text-slate-400">{dateFormatter(n.timestamp, "long")}</p>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
              <Button onClick={handleAddNote}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Dealer Responses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {enquiry.responses.length === 0 && <p className="text-sm text-slate-500">No responses yet.</p>}
          {enquiry.responses.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{r.dealer?.business_name || r.dealer?.name || "—"}</p>
                <Badge className={cn("text-xs capitalize", statusStyles[r.status] || "bg-slate-100 text-slate-700")}>{r.status.toLowerCase()}</Badge>
              </div>
              {r.price !== null && r.price !== undefined && <p className="mt-1 text-sm text-slate-700">Price: {currencyFormatter(r.price)}</p>}
              {r.delivery_days !== null && r.delivery_days !== undefined && <p className="text-sm text-slate-700">Delivery: {r.delivery_days} days</p>}
              {r.warranty && <p className="text-sm text-slate-700">Warranty: {r.warranty}</p>}
              {r.remarks && <p className="text-sm text-slate-600">{r.remarks}</p>}
              <p className="mt-2 text-xs text-slate-400">{dateFormatter(r.created_at, "long")}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <AdminDrawer
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Dealers"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {dealers.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealers.includes(d.id)} onCheckedChange={() => setSelectedDealers((prev) => (prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [d.id]))} />
              <span className="text-sm font-medium text-slate-700">{d.business_name || d.name}</span>
            </label>
          ))}
        </div>
      </AdminDrawer>
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
