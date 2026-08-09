"use client"

import { DashboardHeader } from "./dashboard-header"
import { DealerDashboardCard } from "./dashboard-card"
import { DealerCharts } from "./charts"
import { QuickActions } from "./quick-action"
import { RecentProductsTable } from "./recent-products-table"
import { dashboardStats } from "./data"

export function DealerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <DashboardHeader />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat, index) => (
          <DealerDashboardCard key={stat.title} {...stat} index={index} />
        ))}
      </section>

      <QuickActions />

      <DealerCharts />

      <RecentProductsTable />
    </div>
  )
}
