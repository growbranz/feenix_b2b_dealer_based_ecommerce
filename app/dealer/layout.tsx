import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { DealerShell } from "@/components/dealer/shell"

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userProfile = await getCurrentUserProfile()
  const profile = userProfile?.profile || null

  return <DealerShell profile={profile}>{children}</DealerShell>
}
