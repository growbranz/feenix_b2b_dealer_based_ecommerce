import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Plus } from "lucide-react"

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Add a new product to your inventory"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "My Products", href: "/dealer/products" }, { label: "Add Product" }]}
      />
      <EmptyState
        icon={Plus}
        title="Add New Product"
        description="This page will allow you to add new products to your inventory."
      />
    </div>
  )
}
