import { TemplateManager } from "@/components/email/template-manager"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function EmailTemplatesPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <p className="text-sm text-slate-500">Design and preview transactional email templates.</p>
      </div>
      <TemplateManager />
    </div>
  )
}
