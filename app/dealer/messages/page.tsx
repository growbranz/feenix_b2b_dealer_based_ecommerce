import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Mail } from "lucide-react"

export default function DealerMessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Manage your messages"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Messages" }]}
      />
      <EmptyState
        icon={Mail}
        title="Messages"
        description="This page will allow you to manage all your messages and communications."
      />
    </div>
  )
}
