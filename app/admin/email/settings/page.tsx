import { EmailSettingsForm } from "@/components/email/email-settings-form"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function EmailSettingsPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Settings</h1>
        <p className="text-sm text-slate-500">Configure sender, provider, branding and queue behavior.</p>
      </div>
      <EmailSettingsForm />
    </div>
  )
}
