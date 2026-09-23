"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { EnquiryDataTable } from "./enquiry-data-table"
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
import type { AdminEnquiry, AdminProfile } from "@/lib/admin/enquiries-service"
import {
  getAdminEnquiries,
  getAdminDealers,
  getQuotedEnquiryIds,
  getMonthlyEnquiries,
  getDealerResponseTimes,
  assignEnquirySeller,
  cancelEnquiry,
} from "@/lib/admin/enquiries-service"
import type { EnquiryStatus } from "@/lib/enquiry/data"

const statusStyles: Record<EnquiryStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  COMPLETED: "bg-blue-100 text-blue-700",
}

export function EnquiryDashboard() {
  const [enquiries, setEnquiries] = React.useState<AdminEnquiry[]>([])
  const [dealers, setDealers] = React.useState<AdminProfile[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [assigning, setAssigning] = React.useState<AdminEnquiry | null>(null)
  const [selectedDealers, setSelectedDealers] = React.useState<string[]>([])
  const [cancelId, setCancelId] = React.useState<string | null>(null)

  const [monthlyData, setMonthlyData] = React.useState<{ month: string; enquiries: number }[]>([])
  const [responseTimeData, setResponseTimeData] = React.useState<{ dealer: string; hours: number }[]>([])
  const [quotedCount, setQuotedCount] = React.useState(0)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [fetchedEnquiries, fetchedDealers] = await Promise.all([getAdminEnquiries(), getAdminDealers()])
      setEnquiries(fetchedEnquiries)
      setDealers(fetchedDealers)

      const monthly = await getMonthlyEnquiries(fetchedEnquiries)
      setMonthlyData(monthly)

      const responseTimes = await getDealerResponseTimes(fetchedEnquiries)
      setResponseTimeData(responseTimes)

      const quotedIds = await getQuotedEnquiryIds(fetchedEnquiries.map((e) => e.id))
      setQuotedCount(quotedIds.size)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const stats = React.useMemo(() => {
    return {
      total: enquiries.length,
      pending: enquiries.filter((e) => e.status === "PENDING").length,
      quoted: quotedCount,
      closed: enquiries.filter((e) => e.status === "COMPLETED").length,
    }
  }, [enquiries, quotedCount])

  const openAssign = (enquiry: AdminEnquiry) => {
    setAssigning(enquiry)
    setSelectedDealers([enquiry.seller?.id].filter(Boolean) as string[])
  }

  const closeAssign = () => {
    setAssigning(null)
    setSelectedDealers([])
  }

  const handleAssign = async () => {
    if (!assigning) return
    try {
      const sellerId = selectedDealers[0] || null
      await assignEnquirySeller(assigning.id, sellerId)
      closeAssign()
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign enquiry")
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return
    try {
      await cancelEnquiry(cancelId)
      setCancelId(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel enquiry")
    }
  }

  const toggleDealer = (id: string) => {
    setSelectedDealers((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [id]
    )
  }

  const hasResponseData = responseTimeData.length > 0

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
        <DashboardCard title="Total Enquiries" value={isLoading ? "—" : stats.total.toString()} icon={Inbox} iconGradient="blue" />
        <DashboardCard title="Pending" value={isLoading ? "—" : stats.pending.toString()} icon={Clock} iconGradient="orange" />
        <DashboardCard title="Quoted" value={isLoading ? "—" : stats.quoted.toString()} icon={Send} iconGradient="green" />
        <DashboardCard title="Closed" value={isLoading ? "—" : stats.closed.toString()} icon={CheckCircle2} iconGradient="purple" />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

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
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading...</div>
            ) : (
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
            )}
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
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Loading...</div>
            ) : !hasResponseData ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
                <p>No response time data available yet</p>
                <p className="text-xs text-slate-400">Dealer responses will appear once quotations are sent.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dealer" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
          <p className="text-sm font-medium">Loading enquiries...</p>
        </div>
      ) : (
        <EnquiryDataTable
          enquiries={enquiries}
          onAssign={openAssign}
          onCancel={setCancelId}
          statusStyles={statusStyles}
        />
      )}

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
          <p className="text-sm text-slate-500">Select a dealer to assign this enquiry to.</p>
          {dealers.map((dealer) => (
            <label key={dealer.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Checkbox checked={selectedDealers.includes(dealer.id)} onCheckedChange={() => toggleDealer(dealer.id)} />
              <span className="text-sm font-medium text-slate-700">{dealer.business_name || dealer.name}</span>
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
