import { EmailLogs } from "@/components/email/email-logs"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function EmailLogsPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Logs</h1>
        <p className="text-sm text-slate-500">Track delivery status, retries and queue.</p>
      </div>
      <EmailLogs />
    </div>
  )
}
