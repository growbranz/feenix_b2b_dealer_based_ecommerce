"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getWebhooks, createWebhook, updateWebhook, deleteWebhook, getWebhookLogs, retryFailedWebhooks } from "@/lib/webhooks/actions"
import { Plus, Trash, RotateCcw } from "lucide-react"

const events = ["order.created", "payment.captured", "payment.failed", "refund.completed", "inventory.low", "user.registered"]

export function WebhookManager() {
  const [webhooks, setWebhooks] = React.useState<any[]>([])
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [form, setForm] = React.useState({ name: "", url: "", event: events[0], retry_count: 3 })

  async function load() {
    setLoading(true)
    try {
      const [w, l] = await Promise.all([getWebhooks(), getWebhookLogs()])
      setWebhooks(w)
      setLogs(l)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  async function add() {
    if (!form.name || !form.url) return
    await createWebhook({ name: form.name, url: form.url, event: form.event, retry_count: Number(form.retry_count) })
    setForm({ name: "", url: "", event: events[0], retry_count: 3 })
    await load()
  }

  async function toggleActive(w: any) {
    await updateWebhook(w.id, { is_active: !w.is_active })
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold">Create Webhook</h3>
        <div className="grid gap-2 sm:grid-cols-5">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
          >
            {events.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <Input type="number" placeholder="Retries" value={form.retry_count} onChange={(e) => setForm({ ...form, retry_count: Number(e.target.value) })} />
          <Button onClick={add}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => retryFailedWebhooks().then(load)}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Retry Failed
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3">{w.event}</td>
                  <td className="px-4 py-3 text-xs">{w.url}</td>
                  <td className="px-4 py-3"><Badge className={w.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}>{w.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(w)}>
                        {w.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteWebhook(w.id).then(load)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-sm font-semibold">Recent Webhook Logs</h3>
      <div className="max-h-60 overflow-y-auto rounded-xl border bg-white p-2 dark:bg-slate-900">
        {logs.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No logs yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.slice(0, 20).map((log) => (
              <li key={log.id} className="flex justify-between rounded-md p-2 hover:bg-slate-50">
                <span>{log.event}</span>
                <Badge className={log.status === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>{log.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
