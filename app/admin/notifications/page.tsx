import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage platform notifications"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Notifications" }]}
      />
      <EmptyState
        icon={Bell}
        title="Notifications Management"
        description="This page will allow you to manage all platform notifications and alerts."
      />
    </div>
  )
}
