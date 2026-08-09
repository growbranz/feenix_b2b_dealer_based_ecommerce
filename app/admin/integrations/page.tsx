import { IntegrationsPage } from "@/components/system/integrations-page"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function IntegrationsRoutePage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-slate-500">Manage third-party integrations and monitor system health.</p>
      </div>
      <IntegrationsPage />
    </div>
  )
}
