import { SectionHeader } from "@/components/website/section-header"
import { CategoryCard } from "@/components/website/category-card"
import { EmptyState } from "@/components/website/empty-state"
import { CategoryGridSkeleton } from "@/components/website/skeletons"
import { getCategories } from "@/services/categories"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Categories | Feenix Repair B2B Marketplace",
  description: "Browse our extensive catalog of repair parts and components organized by category. Find electronics, automotive parts, industrial equipment, and more.",
  keywords: ["categories", "repair parts", "electronics", "automotive", "industrial", "components"],
  openGraph: {
    title: "All Categories | Feenix Repair B2B Marketplace",
    description: "Browse our extensive catalog of repair parts and components organized by category.",
    type: "website",
  },
}

async function CategoriesContent() {
  const categories = await getCategories()

  if (categories.length === 0) {
    return (
      <EmptyState 
        type="categories"
        className="py-16"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24 space-y-16">
      <SectionHeader
        title="All Categories"
        description="Browse our extensive catalog of repair parts and components"
        align="center"
      />

      <Suspense fallback={<CategoryGridSkeleton count={6} />}>
        <CategoriesContent />
      </Suspense>
    </div>
  )
}
