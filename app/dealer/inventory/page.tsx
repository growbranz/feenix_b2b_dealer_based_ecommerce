import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Warehouse } from "lucide-react"

export default function DealerInventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage your inventory"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Inventory" }]}
      />
      <EmptyState
        icon={Warehouse}
        title="Inventory Management"
        description="This page will allow you to manage your inventory levels and stock."
      />
    </div>
  )
}
