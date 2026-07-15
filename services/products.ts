import { createServerClient } from '@/lib/supabase/server'
import type { ProductWithDetails, ProductSearchParams, PaginationMeta, FilterOptions } from '@/types/website'

/**
 * Get products with filtering, sorting, and pagination
 */
export async function getProducts(params: ProductSearchParams = {}) {
  const supabase = await createServerClient()
  
  const {
    search,
    category,
    brand,
    model,
    minPrice,
    maxPrice,
    condition,
    availability,
    sortBy = 'newest',
    page = 1,
    limit = 10
  } = params

  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      model:models(*),
      dealer:profiles(*),
      images:product_images(*)
    `, { count: 'exact' })

  // Filter by status (only active products)
  query = query.eq('status', 'ACTIVE')

  // Search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Category filter
  if (category) {
    query = query.eq('category_id', category)
  }

  // Brand filter
  if (brand) {
    query = query.eq('brand_id', brand)
  }

  // Model filter
  if (model) {
    query = query.eq('model_id', model)
  }

  // Price range filter
  if (minPrice !== undefined) {
    query = query.gte('price', minPrice)
  }
  if (maxPrice !== undefined) {
    query = query.lte('price', maxPrice)
  }

  // Condition filter
  if (condition) {
    query = query.eq('condition', condition)
  }

  // Availability filter
  if (availability === 'in_stock') {
    query = query.gt('stock', 0)
  } else if (availability === 'out_of_stock') {
    query = query.eq('stock', 0)
  }

  // Sorting
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'name_asc':
      query = query.order('title', { ascending: true })
      break
    case 'name_desc':
      query = query.order('title', { ascending: false })
      break
  }

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data: products, error, count } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], pagination: createPaginationMeta(0, page, limit) }
  }

  // Transform data to include primary_image
  const transformedProducts = (products || []).map((product: any) => {
    const images = product.images || []
    return {
      ...product,
      primary_image: images.find((img: any) => img.display_order === 0)?.image_url || null
    }
  })

  const pagination = createPaginationMeta(count || 0, page, limit)

  return { products: transformedProducts, pagination }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createServerClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      model:models(*),
      dealer:profiles(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .eq('status', 'ACTIVE')
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  if (!product) {
    return null
  }

  // Transform data to include primary_image
  const images = (product as any).images || []
  const transformedProduct = {
    ...(product as any),
    primary_image: images.find((img: any) => img.display_order === 0)?.image_url || null
  }

  return transformedProduct
}

/**
 * Get filter options (categories, brands, price range)
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createServerClient()

  // Get active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name')

  // Get active brands
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name')

  // Get price range
  const { data: priceData } = await supabase
    .from('products')
    .select('price')
    .eq('status', 'ACTIVE')

  const prices = priceData?.map((p: any) => p.price) || []
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000

  // Get active models
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('name')

  return {
    categories: categories || [],
    brands: brands || [],
    models: models || [],
    priceRange: { min: minPrice, max: maxPrice }
  }
}

/**
 * Get related products (same category, excluding current product)
 */
export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  const supabase = await createServerClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      model:models(*),
      dealer:profiles(*),
      images:product_images(*)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'ACTIVE')
    .neq('id', productId)
    .limit(limit)

  if (error) {
    console.error('Error fetching related products:', error)
    return []
  }

  // Transform data
  const transformedProducts = (products || []).map((product: any) => {
    const images = product.images || []
    return {
      ...product,
      primary_image: images.find((img: any) => img.display_order === 0)?.image_url || null
    }
  })

  return transformedProducts
}

/**
 * Create pagination metadata
 */
function createPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}
