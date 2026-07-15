import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ShoppingCart } from "lucide-react"

export default function DealerOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage your orders"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Orders" }]}
      />
      <EmptyState
        icon={ShoppingCart}
        title="Orders Management"
        description="This page will allow you to manage all your orders."
      />
    </div>
  )
}
