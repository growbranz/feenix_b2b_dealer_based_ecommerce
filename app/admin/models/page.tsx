import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Package } from "lucide-react"

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Models"
        description="Manage product models"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Models" }]}
      />
      <EmptyState
        icon={Package}
        title="Models Management"
        description="This page will allow you to manage all product models."
      />
    </div>
  )
}
