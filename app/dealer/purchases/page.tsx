import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ShoppingBag } from "lucide-react"

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="View your purchase history"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Purchases" }]}
      />
      <EmptyState
        icon={ShoppingBag}
        title="Purchase History"
        description="This page will display your purchase history from other dealers."
      />
    </div>
  )
}
