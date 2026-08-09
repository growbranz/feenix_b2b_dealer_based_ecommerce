import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Settings } from "lucide-react"

export default function DealerSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your dealer settings"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Settings" }]}
      />
      <EmptyState
        icon={Settings}
        title="Dealer Settings"
        description="This page will allow you to manage your dealer settings and preferences."
      />
    </div>
  )
}
