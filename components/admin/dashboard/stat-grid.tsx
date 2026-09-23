"use client"

import { motion } from "framer-motion"
import { DashboardCard } from "@/components/shared/dashboard-card"
import { getAdminDashboardStats } from "@/lib/admin/dashboard-service"
import { useEffect, useState } from "react"
import type { AdminStat } from "./data"
import {
  Users,
  UserCheck,
  Clock,
  Package,
  PackageCheck,
  DollarSign,
  ShoppingCart,
} from "lucide-react"

export function StatGrid() {
  const [stats, setStats] = useState<AdminStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminDashboardStats()
        const adminStats: AdminStat[] = [
          {
            title: "Total Dealers",
            value: data.totalDealers,
            description: "Registered dealers on platform",
            icon: Users,
            iconGradient: "blue",
            trend: {
              value: Math.round(data.percentageChanges.totalDealers),
              isPositive: data.percentageChanges.totalDealers >= 0,
            },
          },
          {
            title: "Active Dealers",
            value: data.activeDealers,
            description: "Currently active partners",
            icon: UserCheck,
            iconGradient: "green",
            trend: {
              value: Math.round(data.percentageChanges.activeDealers),
              isPositive: data.percentageChanges.activeDealers >= 0,
            },
          },
          {
            title: "Pending Dealers",
            value: data.pendingDealers,
            description: "Awaiting approval",
            icon: Clock,
            iconGradient: "orange",
            trend: {
              value: Math.round(data.percentageChanges.pendingDealers),
              isPositive: data.percentageChanges.pendingDealers >= 0,
            },
          },
          {
            title: "Total Products",
            value: data.totalProducts,
            description: "Products listed across dealers",
            icon: Package,
            iconGradient: "indigo",
            trend: {
              value: Math.round(data.percentageChanges.totalProducts),
              isPositive: data.percentageChanges.totalProducts >= 0,
            },
          },
          {
            title: "Pending Products",
            value: data.pendingProducts,
            description: "Products awaiting moderation",
            icon: PackageCheck,
            iconGradient: "red",
            trend: {
              value: Math.round(data.percentageChanges.pendingProducts),
              isPositive: data.percentageChanges.pendingProducts >= 0,
            },
          },
          {
            title: "Revenue",
            value: `₹${data.revenue.toLocaleString('en-IN')}`,
            description: "Total revenue this month",
            icon: DollarSign,
            iconGradient: "purple",
            trend: {
              value: Math.round(data.percentageChanges.revenue),
              isPositive: data.percentageChanges.revenue >= 0,
            },
          },
          {
            title: "Monthly Orders",
            value: data.monthlyOrders,
            description: "Orders processed this month",
            icon: ShoppingCart,
            iconGradient: "blue",
            trend: {
              value: Math.round(data.percentageChanges.monthlyOrders),
              isPositive: data.percentageChanges.monthlyOrders >= 0,
            },
          },
        ]
        setStats(adminStats)
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(7)].map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl bg-slate-100 animate-pulse"
          />
        ))}
      </section>
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
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
