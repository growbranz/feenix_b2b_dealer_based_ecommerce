"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react"

export interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  iconGradient?: "blue" | "green" | "orange" | "red" | "purple" | "indigo"
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const iconGradients = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-emerald-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-rose-500 to-rose-600",
  purple: "from-purple-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-600",
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  iconGradient = "blue",
  trend,
  className
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-semibold text-slate-600">{title}</CardTitle>
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                iconGradients[iconGradient]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
          {description && (
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last month
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
