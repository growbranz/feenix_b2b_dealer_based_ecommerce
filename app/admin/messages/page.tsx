import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Mail } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Manage platform messages"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Messages" }]}
      />
      <EmptyState
        icon={Mail}
        title="Messages Management"
        description="This page will allow you to manage all platform messages and communications."
      />
    </div>
  )
}
