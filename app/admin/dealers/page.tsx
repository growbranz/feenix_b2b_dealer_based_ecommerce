import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Users } from "lucide-react"

export default function DealersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dealers"
        description="Manage all dealers on the platform"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Dealers" }]}
      />
      <EmptyState
        icon={Users}
        title="Dealers Management"
        description="This page will allow you to manage all dealers registered on the platform."
      />
    </div>
  )
}
