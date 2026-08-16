import { SectionHeader } from "@/components/website/section-header"
import { ProductCard } from "@/components/website/product-card"
import { SearchBar } from "@/components/website/search-bar"
import { FilterSidebar, FilterGroup } from "@/components/website/filter-sidebar"
import { Pagination } from "@/components/website/pagination"
import { EmptyState } from "@/components/website/empty-state"
import { ProductGridSkeleton } from "@/components/website/skeletons"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { getProducts, getFilterOptions } from "@/services/products"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Products | Feenix Repair B2B Marketplace",
  description: "Find the perfect parts for your repair needs. Browse our extensive catalog of electronic, automotive, and industrial components.",
  keywords: ["B2B marketplace", "repair parts", "electronics", "automotive", "industrial", "wholesale"],
  openGraph: {
    title: "Browse Products | Feenix Repair B2B Marketplace",
    description: "Find the perfect parts for your repair needs. Browse our extensive catalog of electronic, automotive, and industrial components.",
    type: "website",
  },
}

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    brand?: string
    model?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    availability?: string
    sortBy?: string
    page?: string
  }>
}

interface ProductsContentProps {
  searchParams: {
    search?: string
    category?: string
    brand?: string
    model?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    availability?: string
    sortBy?: string
    page?: string
  }
}

async function ProductsContent({ searchParams }: ProductsContentProps) {
  const params = {
    search: searchParams.search,
    category: searchParams.category,
    brand: searchParams.brand,
    model: searchParams.model,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    condition: searchParams.condition,
    availability: searchParams.availability as 'in_stock' | 'out_of_stock' | undefined,
    sortBy: searchParams.sortBy as any,
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: 12
  }

  const [{ products, pagination }, filterOptions] = await Promise.all([
    getProducts(params),
    getFilterOptions()
  ])

  // Transform filter options to FilterGroup format
  const categoryFilters: FilterGroup = {
    id: "categories",
    title: "Categories",
    options: filterOptions.categories.map(cat => ({
      id: cat.id,
      label: cat.name
    }))
  }

  const brandFilters: FilterGroup = {
    id: "brands",
    title: "Brands",
    options: filterOptions.brands.map(brand => ({
      id: brand.id,
      label: brand.name
    }))
  }

  if (products.length === 0) {
    return (
      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar
            categories={categoryFilters}
            brands={brandFilters}
            priceRange={filterOptions.priceRange}
          />
        </aside>
        <div className="flex-1">
          <EmptyState 
            type={searchParams.search ? "search" : "products"}
            className="py-16"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <FilterSidebar
          categories={categoryFilters}
          brands={brandFilters}
          priceRange={filterOptions.priceRange}
        />
      </aside>

      {/* Products Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24 space-y-10">
      <SectionHeader
        title="Browse Products"
        description="Find the perfect parts for your repair needs"
      />

      {/* Search and Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:w-auto">
          <SearchBar className="w-full md:w-96" />
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <Button
            variant="outline"
            className="md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ProductsContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  )
}
