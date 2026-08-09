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
import { mockEnquiries, Enquiry, EnquiryStatus, dealerOptions, dealerName, statusOptions } from "@/lib/enquiry/data"
import { dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { User, Phone, Mail, MapPin, Building2, Package, Hash, Clock, FileText, StickyNote } from "lucide-react"

const statusStyles: Record<EnquiryStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  QUOTED: "bg-amber-100 text-amber-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-slate-100 text-slate-700",
}

export function EnquiryDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [enquiry, setEnquiry] = React.useState<Enquiry | null>(() => mockEnquiries.find((e) => e.id === id) || null)
  const [note, setNote] = React.useState("")
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [selectedDealers, setSelectedDealers] = React.useState<string[]>([])

  if (!enquiry) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-lg font-medium text-slate-900">Enquiry not found</p>
      </div>
    )
  }

  const addTimeline = (action: string, actor = "Admin") => {
    const now = new Date().toISOString()
    setEnquiry((e) =>
      e
        ? {
            ...e,
            timeline: [...e.timeline, { id: Math.random().toString(36).slice(2), action, actor, timestamp: now }],
            updated_at: now,
          }
        : null
    )
  }

  const handleStatusChange = (status: EnquiryStatus) => {
    setEnquiry((e) => (e ? { ...e, status } : null))
    addTimeline(`Status changed to ${status}`)
  }

  const handleAddNote = () => {
    if (!note.trim()) return
    const now = new Date().toISOString()
    setEnquiry((e) =>
      e
        ? {
            ...e,
            notes: [...e.notes, { id: Math.random().toString(36).slice(2), author: "Admin", text: note, timestamp: now }],
            updated_at: now,
          }
        : null
    )
    setNote("")
    addTimeline("Internal note added")
  }

  const openAssign = () => {
    setSelectedDealers(enquiry.assigned_dealer_ids)
    setAssignOpen(true)
  }

  const handleAssign = () => {
    const action = selectedDealers.length > 0 ? `Assigned to ${selectedDealers.map(dealerName).join(", ")}` : "Unassigned"
    setEnquiry((e) =>
      e
        ? {
            ...e,
            assigned_dealer_ids: selectedDealers,
            status: selectedDealers.length > 0 ? "ASSIGNED" : "NEW",
          }
        : null
    )
    addTimeline(action)
    setAssignOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{enquiry.id}</h1>
          <p className="mt-1 text-sm text-slate-500">{enquiry.product_name}</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            <Info label="Name" value={enquiry.customer_name} icon={User} />
            <Info label="Phone" value={enquiry.phone} icon={Phone} />
            <Info label="Email" value={enquiry.email} icon={Mail} />
            <Info label="Business" value={enquiry.business_name} icon={Building2} />
            <Info label="City" value={enquiry.city} icon={MapPin} />
            <Info label="State" value={enquiry.state} icon={MapPin} />
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
            <Info label="Condition" value={enquiry.preferred_condition} icon={Clock} />
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
          <p>{enquiry.message}</p>
          {enquiry.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {enquiry.attachments.map((a) => (
                <a key={a.id} href={a.url} className="rounded-lg bg-slate-50 px-3 py-1 text-sm text-blue-600 hover:underline">
                  {a.name}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Timeline & Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-4">
              {enquiry.timeline.map((t) => (
                <li key={t.id} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.action}</p>
                    <p className="text-xs text-slate-500">{t.actor} • {dateFormatter(t.timestamp, "long")}</p>
                  </div>
                </li>
              ))}
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
            {enquiry.notes.length === 0 ? <p className="text-sm text-slate-500">No notes.</p> : null}
            {enquiry.notes.map((n) => (
              <div key={n.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-900">{n.author}</p>
                <p className="mt-1 text-slate-700">{n.text}</p>
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
                <p className="font-semibold text-slate-900">{r.dealer_name}</p>
                <Badge className={cn("text-xs capitalize", statusStyles[r.status as EnquiryStatus] || "bg-slate-100 text-slate-700")}>{r.status.toLowerCase()}</Badge>
              </div>
              {r.price !== null && r.price !== undefined && <p className="mt-1 text-sm text-slate-700">Price: ₹{r.price}</p>}
              {r.delivery_days && <p className="text-sm text-slate-700">Delivery: {r.delivery_days} days</p>}
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
          {dealerOptions.map((d) => (
            <label key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealers.includes(d.id)} onCheckedChange={() => setSelectedDealers((prev) => (prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id]))} />
              <span className="text-sm font-medium text-slate-700">{d.name}</span>
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
