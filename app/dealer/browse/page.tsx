import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Search } from "lucide-react"

export default function BrowseProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Products"
        description="Search and browse products from other dealers"
        breadcrumb={[{ label: "Dealer", href: "/dealer" }, { label: "Browse Products" }]}
      />
      <EmptyState
        icon={Search}
        title="Browse Products"
        description="This page will allow you to search and browse products from other dealers on the platform."
      />
    </div>
  )
}
