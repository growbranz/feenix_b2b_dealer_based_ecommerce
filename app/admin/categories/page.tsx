import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Folder } from "lucide-react"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Categories" }]}
      />
      <EmptyState
        icon={Folder}
        title="Categories Management"
        description="This page will allow you to manage product categories and subcategories."
      />
    </div>
  )
}
