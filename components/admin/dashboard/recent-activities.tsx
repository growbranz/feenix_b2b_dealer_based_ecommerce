"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recentActivities } from "./data"
import { cn } from "@/lib/utils"

export function RecentActivities() {
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
          <ul className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon
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
        </CardContent>
      </Card>
    </motion.div>
  )
}
