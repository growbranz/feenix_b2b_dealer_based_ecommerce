import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ShoppingCart } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage all orders"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
      />
      <EmptyState
        icon={ShoppingCart}
        title="Orders Management"
        description="This page will allow you to manage all orders on the platform."
      />
    </div>
  )
}
