import { redirect } from "next/navigation"
import { DealerOrderDetail } from "@/components/dealer/orders/dealer-order-detail"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getDealerOrderDetail } from "@/lib/orders/dealer-service"

export default async function DealerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const order = await getDealerOrderDetail(userProfile.profile.id, id)

  return <DealerOrderDetail initialOrder={order} />
}
