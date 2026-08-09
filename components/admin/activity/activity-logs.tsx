"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { mockLogs, logTypeOptions, logTypeColors } from "./data"
import { dateFormatter } from "@/lib/utils"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 8

export function ActivityLogs() {
  const [logs] = React.useState(mockLogs)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs
      .filter((l) => {
        const matchesSearch =
          !q ||
          l.action.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.target.toLowerCase().includes(q)
        const matchesType = typeFilter === "all" || l.type === typeFilter
        return matchesSearch && matchesType
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, search, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Activity Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Audit admin, dealer, product, CMS, and banner activity.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={logTypeOptions} className="md:w-48" />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Target</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <Badge className={cn("text-xs capitalize", logTypeColors[log.type])}>{log.type.replace(/_/g, " ").toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{log.action}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{log.actor}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{log.target}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{dateFormatter(log.timestamp, "long")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} logs</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-sm disabled:opacity-50"
            >
              ←
            </button>
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {pageCount}</span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-sm disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
