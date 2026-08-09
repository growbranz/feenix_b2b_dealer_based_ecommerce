import { WebhookManager } from "@/components/system/webhook-manager"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function WebhooksPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <p className="text-sm text-slate-500">Manage incoming and outgoing webhooks, verify signatures and retry failures.</p>
      </div>
      <WebhookManager />
    </div>
  )
}
