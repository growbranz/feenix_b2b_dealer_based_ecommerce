"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, Archive, XCircle, Package, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StatusTimelineEntry, ProductStatus } from "./types"

interface StatusTimelineProps {
  timeline: StatusTimelineEntry[]
}

const statusConfig: Record<ProductStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-slate-500/10 text-slate-600", icon: FileText },
  pending_approval: { label: "Pending Approval", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  published: { label: "Published", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
  inactive: { label: "Inactive", color: "bg-slate-500/10 text-slate-600", icon: Archive },
  out_of_stock: { label: "Out of Stock", color: "bg-rose-500/10 text-rose-600", icon: XCircle },
  archived: { label: "Archived", color: "bg-slate-500/10 text-slate-600", icon: Archive },
}

export function StatusTimeline({ timeline }: StatusTimelineProps) {
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  )

  return (
    <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTimeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No status history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTimeline.map((entry, index) => {
              const config = statusConfig[entry.status]
              const Icon = config.icon
              const isLast = index === sortedTimeline.length - 1

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-[19px] top-10 h-full w-0.5 bg-border" />
                  )}

                  {/* Status Icon */}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background",
                      config.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{config.label}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full border-0 px-2 py-0.5 text-xs font-medium",
                          config.color
                        )}
                      >
                        {config.label}
                      </Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(entry.changed_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>by {entry.changed_by}</span>
                    </div>

                    {entry.reason && (
                      <p className="mt-2 text-sm text-muted-foreground italic">
                        "{entry.reason}"
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
