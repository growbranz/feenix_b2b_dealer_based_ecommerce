import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage platform settings"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
      />
      <EmptyState
        icon={Settings}
        title="Platform Settings"
        description="This page will allow you to manage platform-wide settings and configurations."
      />
    </div>
  )
}
