import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { BarChart3 } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View platform reports and analytics"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
      />
      <EmptyState
        icon={BarChart3}
        title="Reports & Analytics"
        description="This page will display comprehensive reports and analytics for the platform."
      />
    </div>
  )
}
