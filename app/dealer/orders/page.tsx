import { redirect } from "next/navigation"
import { DealerOrderList } from "@/components/dealer/orders/dealer-order-list"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getDealerOrders } from "@/lib/orders/dealer-service"

export default async function DealerOrdersPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const dealerId = userProfile.profile.id
  const { data: orders } = await getDealerOrders(dealerId, { limit: 1000 })

  return <DealerOrderList initialOrders={orders} />
}
