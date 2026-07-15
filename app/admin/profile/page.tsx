import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { User } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your admin profile"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Profile" }]}
      />
      <EmptyState
        icon={User}
        title="Admin Profile"
        description="This page will allow you to manage your admin profile and account settings."
      />
    </div>
  )
}
