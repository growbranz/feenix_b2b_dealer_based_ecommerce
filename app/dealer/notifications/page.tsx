import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Bell } from "lucide-react"

export default function DealerNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage your notifications"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Notifications" }]}
      />
      <EmptyState
        icon={Bell}
        title="Notifications"
        description="This page will allow you to manage all your notifications and alerts."
      />
    </div>
  )
}
