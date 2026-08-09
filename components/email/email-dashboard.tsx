"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { getEmailStats } from "@/lib/email/actions"
import { sendQueuedEmails } from "@/lib/email/service"
import { KpiCard } from "@/components/analytics/kpi-card"
import { Mail, Check, X, Clock, Send, RefreshCw } from "lucide-react"

export function EmailDashboard() {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [processing, setProcessing] = React.useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getEmailStats()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function processQueue() {
    setProcessing(true)
    try {
      await sendQueuedEmails(50)
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setProcessing(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Email Automation</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={processQueue} disabled={processing}>
            <Send className="mr-2 h-4 w-4" />
            {processing ? "Processing..." : "Process Queue"}
          </Button>
        </div>
      </div>

      {loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Sent" value={stats.sent} icon={Mail} color="text-blue-500" />
          <KpiCard title="Delivered" value={stats.delivered} icon={Check} color="text-emerald-500" />
          <KpiCard title="Failed" value={stats.failed} icon={X} color="text-rose-500" />
          <KpiCard title="Queued" value={stats.queued} icon={Clock} color="text-amber-500" />
        </motion.div>
      )}
    </div>
  )
}
