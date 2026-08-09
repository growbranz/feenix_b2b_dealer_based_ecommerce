"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: string
  delay?: number
}

export function KpiCard({ title, value, subtitle, icon: Icon, color = "text-orange-500", delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-full bg-slate-100 p-3 dark:bg-slate-800 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}
