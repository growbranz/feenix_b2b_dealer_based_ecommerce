"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Package, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StockHistoryEntry } from "./types"

interface StockHistoryProps {
  history: StockHistoryEntry[]
  productId?: string
}

export function StockHistory({ history, productId }: StockHistoryProps) {
  const filteredHistory = productId
    ? history.filter((h) => h.product_id === productId)
    : history

  const actionConfig: Record<StockHistoryEntry["action"], { label: string; color: string; icon: any }> = {
    increase: { label: "Stock Added", color: "bg-emerald-500/10 text-emerald-600", icon: TrendingUp },
    decrease: { label: "Stock Removed", color: "bg-rose-500/10 text-rose-600", icon: TrendingDown },
    adjustment: { label: "Adjustment", color: "bg-amber-500/10 text-amber-600", icon: Package },
    sale: { label: "Sale", color: "bg-blue-500/10 text-blue-600", icon: TrendingDown },
    return: { label: "Return", color: "bg-purple-500/10 text-purple-600", icon: TrendingUp },
  }

  return (
    <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Stock History</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No stock history available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((entry, index) => {
              const config = actionConfig[entry.action]
              const Icon = config.icon
              const isPositive = entry.action === "increase" || entry.action === "return"

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      config.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{config.label}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "shrink-0 rounded-full border-0 px-2 py-0.5 text-xs font-medium",
                          isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        )}
                      >
                        {isPositive ? "+" : ""}
                        {entry.quantity}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground truncate">
                      {entry.product_title}
                    </p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{entry.created_by}</span>
                      </div>
                    </div>

                    {entry.reason && (
                      <p className="mt-2 text-xs text-muted-foreground italic">
                        "{entry.reason}"
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {entry.previous_stock} → {entry.new_stock}
                      </span>
                    </div>
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
