import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { MessageSquare } from "lucide-react"

export default function EnquiriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        description="Manage product enquiries"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Enquiries" }]}
      />
      <EmptyState
        icon={MessageSquare}
        title="Enquiries Management"
        description="This page will allow you to manage all product enquiries."
      />
    </div>
  )
}
