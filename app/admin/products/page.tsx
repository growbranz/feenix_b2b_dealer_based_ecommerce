import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage all products on the platform"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Products" }]}
      />
      <EmptyState
        icon={Package}
        title="Products Management"
        description="This page will allow you to manage all products listed on the platform."
      />
    </div>
  )
}
