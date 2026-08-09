"use client"

import { motion } from "framer-motion"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { adminStats } from "./data"

export function StatGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {adminStats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.05,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <DashboardCard
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconGradient={stat.iconGradient}
            trend={stat.trend}
            className="rounded-2xl"
          />
        </motion.div>
      ))}
    </section>
  )
}
