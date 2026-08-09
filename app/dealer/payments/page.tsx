import { PageHeader } from "@/components/shared/page-header"
import { PaymentDashboard } from "@/components/payment/payment-dashboard"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function DealerPaymentsPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage your payments and invoices"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Payments" }]}
      />
      <PaymentDashboard mode="dealer" dealerId={userProfile.profile.id} />
    </div>
  )
}
