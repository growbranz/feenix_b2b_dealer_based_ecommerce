import { getPublicCategories } from "@/lib/categories/public"
import type { CategoryWithCount } from "@/types/website"

export async function getNavbarCategories() {
  const categories = await getPublicCategories()

  if (categories.length === 0) {
    return []
  }

  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    icon: category.icon || null,
    count: category.product_count,
  }))
}
