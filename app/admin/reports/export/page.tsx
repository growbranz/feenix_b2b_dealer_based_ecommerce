import { ReportsExportPage } from "@/components/reports/export-page"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function ReportsExportRoutePage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Exports</h1>
        <p className="text-sm text-slate-500">Generate, export and schedule advanced business reports.</p>
      </div>
      <ReportsExportPage />
    </div>
  )
}
