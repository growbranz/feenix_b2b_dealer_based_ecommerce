import { PageHeader } from "@/components/shared/page-header"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { getInventoryStats, getInventoryItems } from "@/lib/inventory/data"

export default async function InventoryPage() {
  const [stats, items] = await Promise.all([
    getInventoryStats(),
    getInventoryItems({ limit: 20 }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage inventory across all dealers"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Inventory" }]}
      />
      <InventoryDashboard initialStats={stats} initialItems={items} isAdmin />
    </div>
  )
}
