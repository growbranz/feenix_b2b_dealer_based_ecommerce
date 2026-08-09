"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getJobs, createJob, retryJob, cancelJob, deleteJob, processJobs } from "@/lib/jobs/actions"
import { Play, RotateCcw, X, Trash, Plus } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-amber-100 text-amber-700",
}

const jobTypes = ["email_queue", "invoice_generation", "report_generation", "inventory_sync", "payment_reconciliation", "notification_queue", "cleanup"]

export function JobsDashboard() {
  const [jobs, setJobs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [processing, setProcessing] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [newType, setNewType] = React.useState("email_queue")

  async function load() {
    setLoading(true)
    try {
      const data = await getJobs()
      setJobs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  async function addJob() {
    if (!newName) return
    await createJob({ name: newName, type: newType })
    setNewName("")
    await load()
  }

  async function run() {
    setProcessing(true)
    try {
      await processJobs(10)
      await load()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold">Create Job</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="Job name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            {jobTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <Button onClick={addJob}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
          <Button variant="outline" onClick={run} disabled={processing}>
            <Play className="mr-2 h-4 w-4" />
            {processing ? "Running..." : "Process"}
          </Button>
        </div>
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
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-4 py-3">{job.name}</td>
                  <td className="px-4 py-3">{job.type}</td>
                  <td className="px-4 py-3"><Badge className={statusColors[job.status] || ""}>{job.status}</Badge></td>
                  <td className="px-4 py-3">{job.attempts}/{job.max_attempts}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(job.created_at).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => retryJob(job.id).then(load)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => cancelJob(job.id).then(load)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteJob(job.id).then(load)}>
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
    </div>
  )
}
