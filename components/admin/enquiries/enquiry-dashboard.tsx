"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { EnquiryDataTable } from "./enquiry-data-table"
import { mockEnquiries, Enquiry, EnquiryStatus, dealerOptions, dealerName } from "@/lib/enquiry/data"
import { Inbox, Clock, CheckCircle2, Send } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts"

const monthlyData = [
  { month: "Jan", enquiries: 12 },
  { month: "Feb", enquiries: 18 },
  { month: "Mar", enquiries: 15 },
  { month: "Apr", enquiries: 22 },
  { month: "May", enquiries: 28 },
  { month: "Jun", enquiries: 34 },
]

const responseTimeData = [
  { dealer: "MobileSpares", hours: 4.2 },
  { dealer: "PhoneCare", hours: 6.5 },
  { dealer: "DisplayMax", hours: 8.1 },
  { dealer: "Feenix Store", hours: 3.5 },
]

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

export function EnquiryDashboard() {
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>(mockEnquiries)
  const [assigning, setAssigning] = React.useState<Enquiry | null>(null)
  const [selectedDealers, setSelectedDealers] = React.useState<string[]>([])
  const [cancelId, setCancelId] = React.useState<string | null>(null)

  const stats = React.useMemo(() => {
    const counts = {
      total: enquiries.length,
      new: enquiries.filter((e) => e.status === "NEW").length,
      assigned: enquiries.filter((e) => e.status === "ASSIGNED").length,
      pending: enquiries.filter((e) => e.status === "NEW" || e.status === "ASSIGNED").length,
      quoted: enquiries.filter((e) => e.status === "QUOTED").length,
      closed: enquiries.filter((e) => e.status === "CLOSED").length,
      cancelled: enquiries.filter((e) => e.status === "CANCELLED").length,
    }
    return counts
  }, [enquiries])

  const openAssign = (enquiry: Enquiry) => {
    setAssigning(enquiry)
    setSelectedDealers(enquiry.assigned_dealer_ids)
  }

  const closeAssign = () => {
    setAssigning(null)
    setSelectedDealers([])
  }

  const handleAssign = () => {
    if (!assigning) return
    const now = new Date().toISOString()
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === assigning.id
          ? {
              ...e,
              assigned_dealer_ids: selectedDealers,
              status: selectedDealers.length > 0 ? "ASSIGNED" : "NEW",
              timeline: [
                ...e.timeline,
                {
                  id: Math.random().toString(36).slice(2),
                  action: selectedDealers.length > 0 ? `Assigned to ${selectedDealers.map(dealerName).join(", ")}` : "Unassigned",
                  actor: "Admin",
                  timestamp: now,
                },
              ],
              updated_at: now,
            }
          : e
      )
    )
    closeAssign()
  }

  const handleCancel = () => {
    if (!cancelId) return
    const now = new Date().toISOString()
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === cancelId
          ? {
              ...e,
              status: "CANCELLED",
              timeline: [...e.timeline, { id: Math.random().toString(36).slice(2), action: "Cancelled", actor: "Admin", timestamp: now }],
              updated_at: now,
            }
          : e
      )
    )
    setCancelId(null)
  }

  const toggleDealer = (id: string) => {
    setSelectedDealers((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Enquiries</h1>
        <p className="mt-1 text-sm text-slate-500">Review, assign, and manage customer enquiries.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Enquiries" value={stats.total.toString()} icon={Inbox} iconGradient="blue" />
        <DashboardCard title="Pending" value={stats.pending.toString()} icon={Clock} iconGradient="orange" />
        <DashboardCard title="Quoted" value={stats.quoted.toString()} icon={Send} iconGradient="green" />
        <DashboardCard title="Closed" value={stats.closed.toString()} icon={CheckCircle2} iconGradient="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">Monthly Enquiries</h3>
          <p className="text-sm text-slate-500">Enquiry volume over the last 6 months</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Area type="monotone" dataKey="enquiries" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEnq)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-900">Dealer Response Time</h3>
          <p className="text-sm text-slate-500">Average hours to first response</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dealer" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <EnquiryDataTable enquiries={enquiries} onAssign={openAssign} onCancel={setCancelId} statusStyles={statusStyles} />

      <AdminDrawer
        open={!!assigning}
        onClose={closeAssign}
        title={assigning ? `Assign ${assigning.id}` : "Assign Dealers"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeAssign}>Cancel</Button>
            <Button onClick={handleAssign}>Save Assignment</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Select one or more dealers to assign this enquiry to.</p>
          {dealerOptions.map((dealer) => (
            <label key={dealer.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealers.includes(dealer.id)} onCheckedChange={() => toggleDealer(dealer.id)} />
              <span className="text-sm font-medium text-slate-700">{dealer.name}</span>
            </label>
          ))}
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!cancelId}
        onOpenChange={(open) => { if (!open) setCancelId(null) }}
        title="Cancel Enquiry"
        description="Are you sure you want to cancel this enquiry?"
        confirmText="Cancel"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </motion.div>
  )
}

export { statusStyles }
