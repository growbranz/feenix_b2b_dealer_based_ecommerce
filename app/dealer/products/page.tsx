import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"

export default function MyProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Products"
        description="Manage your product listings"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "My Products" }]}
      />
      <EmptyState
        icon={Package}
        title="My Products"
        description="This page will allow you to manage all your product listings."
      />
    </div>
  )
}
