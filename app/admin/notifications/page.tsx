import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ActivityTimeline } from "@/components/notifications/activity-timeline"
import { NotificationToasts } from "@/components/notifications/notification-toasts"

export default async function AdminNotificationsPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NotificationCenter userId={userProfile.profile.id} mode="admin" />
        </div>
        <div className="lg:col-span-1">
          <ActivityTimeline limit={20} />
        </div>
      </div>
      <NotificationToasts userId={userProfile.profile.id} />
    </div>
  )
}
