"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentActivities } from "@/lib/admin/dashboard-service"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
  Building2,
  CheckCircle2,
  XCircle,
  Settings,
  Layers,
  Activity,
  Package,
  ShoppingCart,
  UserCheck,
  DollarSign,
} from "lucide-react"

const iconMap: Record<string, any> = {
  Building2,
  CheckCircle2,
  XCircle,
  Settings,
  Layers,
  Activity,
  Package,
  ShoppingCart,
  UserCheck,
  DollarSign,
}

export function RecentActivities() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await getRecentActivities()
        setActivities(data)
      } catch (error) {
        console.error("Error loading activities:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
          ) : (
            <ul className="space-y-4">
              {activities.map((activity) => {
                const Icon = iconMap[activity.icon] || Activity
                return (
                  <li
                    key={activity.id}
                    className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        activity.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {activity.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {activity.time}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
