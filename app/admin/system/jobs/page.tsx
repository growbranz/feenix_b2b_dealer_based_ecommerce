import { JobsDashboard } from "@/components/system/jobs-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function SystemJobsPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Background Jobs</h1>
        <p className="text-sm text-slate-500">Queue, process, retry and monitor system jobs.</p>
      </div>
      <JobsDashboard />
    </div>
  )
}
