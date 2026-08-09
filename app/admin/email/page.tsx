import { EmailDashboard } from "@/components/email/email-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function AdminEmailDashboardPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Automation</h1>
        <p className="text-sm text-slate-500">Manage templates, logs, queue and settings.</p>
      </div>
      <EmailDashboard />
    </div>
  )
}
