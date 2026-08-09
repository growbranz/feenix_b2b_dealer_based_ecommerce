import { getInventoryLedger } from "@/lib/inventory/data"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { HistoryDashboard } from "@/components/inventory/history-dashboard"
import { redirect } from "next/navigation"

export default async function DealerInventoryHistoryPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const { data: ledger } = await getInventoryLedger({
    dealerId: userProfile.profile.id,
    limit: 50,
  })

  return <HistoryDashboard initialLedger={ledger as any} />
}
