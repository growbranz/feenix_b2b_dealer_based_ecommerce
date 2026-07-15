import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Globe } from "lucide-react"

export default function CMSPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Website CMS"
        description="Manage website content"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Website CMS" }]}
      />
      <EmptyState
        icon={Globe}
        title="Content Management System"
        description="This page will allow you to manage website content, pages, and media."
      />
    </div>
  )
}
