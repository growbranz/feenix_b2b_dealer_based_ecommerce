import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { User } from "lucide-react"

export default function DealerProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your dealer profile"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Profile" }]}
      />
      <EmptyState
        icon={User}
        title="Dealer Profile"
        description="This page will allow you to manage your dealer profile and account settings."
      />
    </div>
  )
}
