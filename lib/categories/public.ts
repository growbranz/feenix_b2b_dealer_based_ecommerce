import { createServerClient } from "@/lib/supabase/server"
import type { CategoryWithCount } from "@/types/website"

export async function getPublicCategoriesWithProductCounts(limit: number = 8): Promise<CategoryWithCount[]> {
  try {
    const supabase = await createServerClient()
    
    // Step 1: Fetch all active categories (without product relationship to avoid filtering)
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        description,
        image,
        icon,
        display_order,
        status,
        created_at,
        updated_at
      `)
      .eq("status", "ACTIVE")
      .order("display_order", { ascending: true })

    if (categoriesError) throw categoriesError

    if (!categories || categories.length === 0) {
      return []
    }

    // Step 2: Fetch product counts for all active categories
    const categoryIds = categories.map((c: any) => c.id)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("category_id")
      .eq("status", "ACTIVE")
      .in("category_id", categoryIds)

    if (productsError) throw productsError

    // Step 3: Count products per category
    const productCounts = new Map<string, number>()
    ;(products || []).forEach((product: any) => {
      const count = productCounts.get(product.category_id) || 0
      productCounts.set(product.category_id, count + 1)
    })

    // Step 4: Merge categories with product counts
    const categoriesWithCounts: CategoryWithCount[] = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      display_order: category.display_order,
      status: category.status,
      created_at: category.created_at,
      updated_at: category.updated_at,
      product_count: productCounts.get(category.id) || 0,
    }))

    // Step 5: Apply limit
    return categoriesWithCounts.slice(0, limit)
  } catch (error) {
    console.error("Failed to fetch categories with product counts:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    })
    return []
  }
}

export async function getPublicCategories(): Promise<CategoryWithCount[]> {
  return getPublicCategoriesWithProductCounts()
}
