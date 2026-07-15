import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { TrendingUp } from "lucide-react"

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        description="View your sales history and analytics"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Sales" }]}
      />
      <EmptyState
        icon={TrendingUp}
        title="Sales Analytics"
        description="This page will display your sales history and analytics."
      />
    </div>
  )
}
