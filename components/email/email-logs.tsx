"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getEmailLogs, getEmailQueue, retryEmailQueue } from "@/lib/email/actions"
import { Badge } from "@/components/ui/badge"
import type { EmailLogStatus } from "@/types/email"
import { Search, RefreshCw, RotateCcw } from "lucide-react"

const statusColors: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  opened: "bg-purple-100 text-purple-700",
  failed: "bg-rose-100 text-rose-700",
  bounced: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-700",
}

export function EmailLogs() {
  const [tab, setTab] = React.useState<"sent" | "queue">("sent")
  const [logs, setLogs] = React.useState<any[]>([])
  const [queue, setQueue] = React.useState<any[]>([])
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  async function load() {
    setLoading(true)
    try {
      if (tab === "sent") {
        const result = await getEmailLogs({ search, status: (status || undefined) as any, page, limit: 25 })
        setLogs(result.data)
        setTotalPages(result.totalPages)
      } else {
        const result = await getEmailQueue({ status: (status || undefined) as any, page, limit: 25 })
        setQueue(result.data)
        setTotalPages(result.totalPages)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [tab, page])

  async function retryQueue() {
    await retryEmailQueue()
    await load()
  }

  const rows = tab === "sent" ? logs : queue

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button variant={tab === "sent" ? "default" : "outline"} size="sm" onClick={() => { setTab("sent"); setPage(1) }}>Sent / Logs</Button>
          <Button variant={tab === "queue" ? "default" : "outline"} size="sm" onClick={() => { setTab("queue"); setPage(1) }}>Queue</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
          </div>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <Button size="sm" onClick={() => { setPage(1); load() }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Load
          </Button>
          {tab === "queue" && (
            <Button size="sm" variant="outline" onClick={retryQueue}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-slate-500">No {tab} emails found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.recipient}</td>
                  <td className="px-4 py-3">{row.template_key}</td>
                  <td className="px-4 py-3">{row.subject}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[row.status] || ""}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(row.created_at).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="px-2 py-1 text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
