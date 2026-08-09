import { PageHeader } from "@/components/shared/page-header"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getInventoryStats, getInventoryItems } from "@/lib/inventory/data"
import { redirect } from "next/navigation"

export default async function DealerInventoryPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const dealerId = userProfile.profile.id
  const [stats, items] = await Promise.all([
    getInventoryStats({ dealerId }),
    getInventoryItems({ dealerId, limit: 20 }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Inventory"
        description="Monitor and manage your stock levels"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Inventory" }]}
      />
      <InventoryDashboard initialStats={stats} initialItems={items} dealerId={dealerId} />
    </div>
  )
}
