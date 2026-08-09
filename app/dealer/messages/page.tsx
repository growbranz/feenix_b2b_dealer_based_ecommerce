import { ChatLayout } from "@/components/chat/chat-layout"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function DealerMessagesPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  return (
    <div className="space-y-4">
      <ChatLayout
        mode="dealer"
        currentUser={{
          id: userProfile.profile.id,
          name: userProfile.profile.name,
          avatar_url: userProfile.profile.profile_image,
          role: userProfile.profile.role,
        }}
      />
    </div>
  )
}
