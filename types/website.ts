// Extended types for website with joined data
import type { Product, Category, Brand, Model, Profile, ProductImage } from './index'

// Product with related data for website display
export interface ProductWithDetails extends Product {
  category: Category
  brand: Brand
  model: Model
  dealer: Profile
  images: ProductImage[]
  primary_image: string | null
}

// Category with product count
export interface CategoryWithCount extends Category {
  product_count: number
}

// Filter options
export interface FilterOptions {
  categories: Category[]
  brands: Brand[]
  models: Model[]
  priceRange: {
    min: number
    max: number
  }
}

// Search params for products
export interface ProductSearchParams {
  search?: string
  category?: string
  brand?: string
  model?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  availability?: 'in_stock' | 'out_of_stock'
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'
  page?: number
  limit?: number
}

// Pagination metadata
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Product listing response
export interface ProductListingResponse {
  products: ProductWithDetails[]
  pagination: PaginationMeta
  filters: FilterOptions
}
