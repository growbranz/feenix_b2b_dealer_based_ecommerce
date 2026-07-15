import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { CreditCard } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage all payments"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
      />
      <EmptyState
        icon={CreditCard}
        title="Payments Management"
        description="This page will allow you to manage all payments and transactions."
      />
    </div>
  )
}
