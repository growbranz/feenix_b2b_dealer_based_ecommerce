import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CreditCard } from "lucide-react"

export default function DealerPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage your payments"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Payments" }]}
      />
      <EmptyState
        icon={CreditCard}
        title="Payments Management"
        description="This page will allow you to manage all your payments and transactions."
      />
    </div>
  )
}
