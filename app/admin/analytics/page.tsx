import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function AdminAnalyticsPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer/analytics")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">Real-time business intelligence across the platform.</p>
      </div>
      <AnalyticsDashboard mode="admin" />
    </div>
  )
}
