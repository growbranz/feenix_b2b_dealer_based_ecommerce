import { requireAdmin } from "@/lib/auth/auth.helpers"
import { AdminShell } from "@/components/admin/layout/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireAdmin()

  return <AdminShell profile={profile}>{children}</AdminShell>
}
