import { ExecutiveDashboard } from "@/components/executive-dashboard/executive-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function ExecutiveDashboardPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <ExecutiveDashboard />
    </div>
  )
}
