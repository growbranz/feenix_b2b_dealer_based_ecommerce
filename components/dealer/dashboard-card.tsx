"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { DashboardCard } from "@/components/shared/dashboard-card"
import type { DashboardStat } from "./types"

interface DealerDashboardCardProps extends DashboardStat {
  index?: number
}

const iconGradients: Record<string, "blue" | "green" | "orange" | "red" | "purple" | "indigo"> = {
  "Total Products": "blue",
  "Active Products": "green",
  "Pending Orders": "orange",
  "Total Revenue": "purple",
  "Low Stock": "red",
}

export function DealerDashboardCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  index = 0,
}: DealerDashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <DashboardCard
        title={title}
        value={value}
        icon={Icon}
        iconGradient={iconGradients[title] || "blue"}
        description={description}
        trend={trend}
      />
    </motion.div>
  )
}
