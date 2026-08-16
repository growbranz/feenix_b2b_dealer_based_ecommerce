"use client"

import { DashboardHeader } from "./dashboard-header"
import { DealerDashboardCard } from "./dashboard-card"
import { DealerCharts } from "./charts"
import { QuickActions } from "./quick-action"
import { RecentProductsTable } from "./recent-products-table"
import type { DashboardStats, ProductStatusData } from "@/lib/dealer/dashboard-service"
import type { RecentProduct } from "@/lib/dealer/dashboard-service"
import { formatINR } from "@/lib/dealer/dashboard-utils"
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
} from "lucide-react"

interface DealerDashboardPageProps {
  stats: DashboardStats
  recentProducts: RecentProduct[]
  productStatusData: ProductStatusData[]
}

export function DealerDashboardPage({ stats, recentProducts, productStatusData }: DealerDashboardPageProps) {
  const dashboardStats = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      description: "All listed products",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: CheckCircle2,
      description: "Live on marketplace",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockProducts,
      icon: AlertCircle,
      description: "Needs restocking",
    },
    {
      title: "Pending Approval",
      value: stats.pendingApprovalProducts,
      icon: Clock,
      description: "Awaiting admin review",
    },
    {
      title: "Revenue",
      value: formatINR(stats.totalRevenue),
      icon: DollarSign,
      description: "Total earnings",
    },
    {
      title: "Recent Activity",
      value: stats.totalOrders + stats.totalEnquiries,
      icon: Activity,
      description: "Orders and enquiries",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <DashboardHeader />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat, index) => (
          <DealerDashboardCard key={stat.title} {...stat} index={index} />
        ))}
      </section>

      <QuickActions />

      <DealerCharts productStatusData={productStatusData} />

      <RecentProductsTable recentProducts={recentProducts} />
    </div>
  )
}
