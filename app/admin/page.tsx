import { WelcomeCard } from "@/components/admin/dashboard/welcome-card"
import { StatGrid } from "@/components/admin/dashboard/stat-grid"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { RecentActivities } from "@/components/admin/dashboard/recent-activities"
import { AdminCharts } from "@/components/admin/dashboard/admin-charts"
import { AdminWidgets } from "@/components/admin/dashboard/admin-widgets"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <WelcomeCard />
      <StatGrid />
      <QuickActions />
      <AdminWidgets />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminCharts />
        </div>
        <div>
          <RecentActivities />
        </div>
      </div>
    </div>
  )
}
