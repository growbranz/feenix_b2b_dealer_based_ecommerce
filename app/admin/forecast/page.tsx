import { ForecastDashboard } from "@/components/forecast/forecast-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function ForecastPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forecasting</h1>
        <p className="text-sm text-slate-500">Predict revenue, sales, inventory demand and seasonal trends.</p>
      </div>
      <ForecastDashboard />
    </div>
  )
}
