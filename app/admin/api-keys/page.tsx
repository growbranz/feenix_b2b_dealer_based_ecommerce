import { ApiKeyManager } from "@/components/system/api-key-manager"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { redirect } from "next/navigation"

export default async function ApiKeysPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")
  if (userProfile.profile.role !== "ADMIN") redirect("/dealer")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-sm text-slate-500">Generate, rotate and revoke API keys with usage tracking.</p>
      </div>
      <ApiKeyManager />
    </div>
  )
}
