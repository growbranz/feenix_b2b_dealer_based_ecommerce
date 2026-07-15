import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Warehouse } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage inventory across all dealers"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Inventory" }]}
      />
      <EmptyState
        icon={Warehouse}
        title="Inventory Management"
        description="This page will allow you to manage inventory across all dealers."
      />
    </div>
  )
}
