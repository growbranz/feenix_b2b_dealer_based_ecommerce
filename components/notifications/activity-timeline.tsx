"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getActivityLogs } from "@/lib/notifications/actions"
import { Activity, User, Package, CreditCard, MessageSquare, Users, AlertCircle, ShoppingCart, FileText } from "lucide-react"

const entityIcons: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  inventory: <Package className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  dealer: <Users className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  notification: <FileText className="h-4 w-4" />,
}

interface ActivityTimelineProps {
  limit?: number
}

export function ActivityTimeline({ limit = 20 }: ActivityTimelineProps) {
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const result = await getActivityLogs({ limit })
        setLogs(result.data)
      } catch (e: any) {
        console.warn("Failed to load activity logs", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [limit])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Timeline</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-slate-500">No recent activity.</p>
      ) : (
        <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-full before:w-px before:bg-slate-200">
          {logs.map((log) => (
            <div key={log.id} className="relative">
              <span className="absolute -left-4 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                {entityIcons[log.entity_type || ""] || <Activity className="h-3 w-3" />}
              </span>
              <div className="rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-slate-500">
                  {log.entity_type} {log.entity_id ? `· ${log.entity_id.slice(0, 8)}` : ""} · {log.status || "completed"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(log.created_at).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
