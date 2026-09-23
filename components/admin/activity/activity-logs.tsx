"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { getActivityLogsAction, getActivityLogTypesAction } from "@/lib/activity/actions"
import { 
  formatActivityType, 
  formatActivityAction, 
  formatTargetName, 
  formatActorName,
  getActivityTypeColor 
} from "@/lib/activity/formatters"
import type { ActivityLog } from "@/types"
import type { ActivityType } from "@/lib/activity/service"
import { cn, dateFormatter } from "@/lib/utils"
import { Clock, RotateCcw, Filter, Activity, Bot } from "lucide-react"
import { Select } from "@/components/ui/select"

const PAGE_SIZE = 20

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return dateFormatter(timestamp, "short")
}

export function ActivityLogs() {
  const [logs, setLogs] = React.useState<ActivityLog[]>([])
  const [availableTypes, setAvailableTypes] = React.useState<ActivityType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)

  const loadLogs = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getActivityLogsAction({
        search,
        type: typeFilter === "all" ? undefined : typeFilter,
        page,
        limit: PAGE_SIZE,
      })
      setLogs(result.data || [])
      setTotalCount(result.count || 0)
    } catch (e: any) {
      console.error("Failed to load activity logs:", e)
      setError(e.message || "Failed to load activity logs")
      setLogs([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, page])

  const loadTypes = React.useCallback(async () => {
    try {
      const types = await getActivityLogTypesAction()
      setAvailableTypes(types || [])
    } catch (e) {
      console.error("Failed to load activity types:", e)
      setAvailableTypes([])
    }
  }, [])

  React.useEffect(() => {
    loadLogs()
  }, [loadLogs])

  React.useEffect(() => {
    loadTypes()
  }, [loadTypes])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleTypeChange = (value: string) => {
    setTypeFilter(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch("")
    setTypeFilter("all")
    setPage(1)
  }

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {error && (
        <motion.div variants={itemVariants} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Activity Logs</h1>
          <p className="mt-1 text-sm text-slate-500">Audit trail of all system actions and events.</p>
        </div>
        <Button variant="outline" onClick={loadLogs} disabled={loading}>
          <RotateCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search activity logs..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="h-10 w-full md:w-48 rounded-xl"
        >
          <option value="all">All Types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {formatActivityType(type)}
            </option>
          ))}
        </Select>
        {(search || typeFilter !== "all") && (
          <Button variant="outline" onClick={handleClearFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="space-y-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </motion.div>
      ) : logs.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No activity yet"
            description="Actions performed in the admin panel will appear here."
            icon={Activity}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Badge
                        className={cn(
                          "text-xs border font-medium",
                          getActivityTypeColor(log.type)
                        )}
                      >
                        {formatActivityType(log.type)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {formatActivityAction(log.action)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        {(!log.actor_name || log.actor_name.toLowerCase() === 'system') && (
                          <Bot className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>{formatActorName(log.actor_name)}</span>
                        {log.actor_role && log.actor_name && log.actor_name.toLowerCase() !== 'system' && (
                          <span className="text-xs text-slate-400">({log.actor_role.toLowerCase()})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatTargetName(log.target_name)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span title={dateFormatter(log.created_at, "long")}>
                          {formatRelativeTime(log.created_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {logs.length} of {totalCount} logs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 rounded-lg"
                >
                  ←
                </Button>
                <span className="text-sm font-medium text-slate-600">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  className="h-8 w-8 rounded-lg"
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
