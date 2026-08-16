import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"
import { DealerDashboardPage } from "@/components/dealer/dashboard-page"
import { getDealerDashboardStats, getDealerRecentProducts, getDealerProductStatusData } from "@/lib/dealer/dashboard-service"

export default async function DealerPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) {
    redirect("/auth/login")
  }

  const dealerId = userProfile.profile.id

  // Fetch real dashboard data
  const [stats, recentProducts, productStatusData] = await Promise.all([
    getDealerDashboardStats(),
    getDealerRecentProducts(7),
    getDealerProductStatusData(),
  ])

  return (
    <DealerDashboardPage
      stats={stats}
      recentProducts={recentProducts}
      productStatusData={productStatusData}
    />
  )
}
