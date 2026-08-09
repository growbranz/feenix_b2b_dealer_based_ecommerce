import { PageHeader } from "@/components/shared/page-header"
import { PaymentDashboard } from "@/components/payment/payment-dashboard"

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage all payments, refunds and invoices"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
      />
      <PaymentDashboard mode="admin" />
    </div>
  )
}
