"use client"

import { motion } from "framer-motion"
import { Package, TrendingUp, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { InventoryStats } from "./types"

interface InventorySummaryCardsProps {
  stats: InventoryStats
}

const iconGradients = {
  "Total Stock": "from-blue-500 to-blue-600",
  "Available Stock": "from-emerald-500 to-emerald-600",
  "Low Stock": "from-amber-500 to-amber-600",
  "Out of Stock": "from-rose-500 to-rose-600",
  "Inventory Value": "from-purple-500 to-purple-600",
}

export function InventorySummaryCards({ stats }: InventorySummaryCardsProps) {
  const cards = [
    {
      title: "Total Stock",
      value: stats.total_stock.toLocaleString(),
      icon: Package,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Available Stock",
      value: stats.available_stock.toLocaleString(),
      icon: Package,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Low Stock",
      value: stats.low_stock_count,
      icon: AlertTriangle,
      trend: { value: 3, isPositive: false },
      warning: true,
    },
    {
      title: "Out of Stock",
      value: stats.out_of_stock_count,
      icon: AlertTriangle,
      trend: { value: 2, isPositive: false },
      warning: true,
    },
    {
      title: "Inventory Value",
      value: `₹${(stats.inventory_value / 100000).toFixed(2)}L`,
      icon: DollarSign,
      trend: { value: 15, isPositive: true },
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon
        const gradient = iconGradients[card.title as keyof typeof iconGradients]
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.4, 0, 0.2, 1],
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Card
              className={cn(
                "h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
                card.warning && "border-amber-300"
              )}
            >
              <CardContent className="flex h-full flex-col justify-between p-0">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    {card.title}
                  </span>
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                      gradient
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </p>
                  {card.trend && (
                    <div
                      className={cn(
                        "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                        card.trend.isPositive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      )}
                    >
                      {card.trend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {card.trend.isPositive ? "+" : ""}
                      {card.trend.value}% from last month
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
