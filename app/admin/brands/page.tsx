import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Tag } from "lucide-react"

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        description="Manage product brands"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Brands" }]}
      />
      <EmptyState
        icon={Tag}
        title="Brands Management"
        description="This page will allow you to manage all product brands."
      />
    </div>
  )
}
