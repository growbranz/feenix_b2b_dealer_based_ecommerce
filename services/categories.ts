import { createServerClient } from '@/lib/supabase/server'
import type { CategoryWithCount } from '@/types/website'

/**
 * Get all categories with product counts
 */
export async function getCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createServerClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products(count)
    `)
    .eq('status', 'ACTIVE')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Transform data to include product count
  const transformedCategories = (categories || []).map((category: any) => ({
    ...category,
    product_count: category.products?.length || 0
  }))

  return transformedCategories
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const supabase = await createServerClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'ACTIVE')
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return category
}

/**
 * Get categories with product count for a specific brand
 */
export async function getCategoriesByBrand(brandId: string) {
  const supabase = await createServerClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products(count)
    `)
    .eq('status', 'ACTIVE')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  // Filter categories that have products from the specified brand
  const transformedCategories = (categories || [])
    .filter((category: any) => 
      category.products?.some((product: any) => product.brand_id === brandId)
    )
    .map((category: any) => ({
      ...category,
      product_count: category.products?.filter((product: any) => product.brand_id === brandId).length || 0
    }))

  return transformedCategories
}
