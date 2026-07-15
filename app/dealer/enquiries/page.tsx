import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { MessageSquare } from "lucide-react"

export default function MyEnquiriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Enquiries"
        description="Manage your product enquiries"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "My Enquiries" }]}
      />
      <EmptyState
        icon={MessageSquare}
        title="My Enquiries"
        description="This page will allow you to manage all your product enquiries."
      />
    </div>
  )
}
