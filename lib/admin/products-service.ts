"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { logActivity } from "@/lib/activity/service"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import { revalidatePath } from "next/cache"
import {
  notifyProductApproved,
  notifyProductRejected,
  notifyProductSuspended,
  notifyProductDeactivated,
  logProductActivity,
} from "@/lib/notifications/dealer-product-notifications"

// Validate Supabase admin configuration at module load
try {
  console.log("Admin Products Service - Validating Supabase admin configuration")
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured")
  }
  console.log("Admin Products Service - Supabase admin configuration validated")
} catch (error) {
  console.error("Admin Products Service - Configuration validation failed:", error)
}

export interface AdminProduct {
  id: string
  title: string
  slug: string
  description: string
  brand_id: string
  brand_name: string
  category_id: string
  category_name: string
  model_id: string
  model_name: string
  dealer_id: string
  dealer_name: string
  dealer_email: string
  price: number
  bulk_price: number | null
  stock: number
  min_order: number
  condition: string | null
  quality: string | null
  warranty: string | null
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "INACTIVE" | "SUSPENDED"
  featured: boolean
  premium: boolean
  images: string[]
  created_at: string
  updated_at: string
}

export interface FilterOptions {
  search?: string
  brandId?: string
  categoryId?: string
  dealerId?: string
  status?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Get all products for admin with filtering and pagination
 */
export async function getAdminProducts(
  filters: FilterOptions = {},
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<AdminProduct>> {
  try {
    console.log("Admin Products - Starting getAdminProducts with filters:", filters)

    let query = supabaseAdmin
      .from("products")
      .select(`
        id,
        title,
        slug,
        description,
        brand_id,
        category_id,
        model_id,
        dealer_id,
        price,
        bulk_price,
        stock,
        minimum_order,
        condition,
        quality,
        warranty,
        status,
        featured,
        premium,
        created_at,
        updated_at,
        dealer:profiles(business_name, email),
        brand:brands(name),
        category:categories(name),
        model:models(name),
        images:product_images(image_url)
      `, { count: "exact" })

    console.log("Admin Products - Base query created")

    // Apply filters
    if (filters.search) {
      // First try with both title and sku, if sku doesn't exist fall back to title only
      try {
        query = query.or(`title.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
        console.log("Admin Products - Applied search filter with title and sku:", filters.search)
      } catch (e) {
        // If sku column doesn't exist, fall back to title only
        console.log("Admin Products - SKU column might not exist, falling back to title only search")
        query = query.ilike("title", `%${filters.search}%`)
        console.log("Admin Products - Applied search filter with title only:", filters.search)
      }
    }

    if (filters.brandId && filters.brandId !== "all") {
      query = query.eq("brand_id", filters.brandId)
      console.log("Admin Products - Applied brand filter:", filters.brandId)
    }

    if (filters.categoryId && filters.categoryId !== "all") {
      query = query.eq("category_id", filters.categoryId)
      console.log("Admin Products - Applied category filter:", filters.categoryId)
    }

    if (filters.dealerId && filters.dealerId !== "all") {
      query = query.eq("dealer_id", filters.dealerId)
      console.log("Admin Products - Applied dealer filter:", filters.dealerId)
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
      console.log("Admin Products - Applied status filter:", filters.status)
    }

    // Get total count
    console.log("Admin Products - Executing count query")
    const { count, error: countError } = await query

    if (countError) {
      console.error("Admin Products - Count query failed:", countError)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    console.log("Admin Products - Count query successful, total:", count)

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    console.log("Admin Products - Executing data query with range:", from, to)
    const { data: products, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.error("Admin Products - Data query failed:", error)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    console.log("Admin Products - Data query successful, products count:", products?.length)

    const formattedProducts = (products || []).map((product: any) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description || "",
      brand_id: product.brand_id,
      brand_name: product.brand?.name || "",
      category_id: product.category_id,
      category_name: product.category?.name || "",
      model_id: product.model_id,
      model_name: product.model?.name || "",
      dealer_id: product.dealer_id,
      dealer_name: product.dealer?.business_name || product.dealer?.name || "Unknown",
      dealer_email: product.dealer?.email || "",
      price: product.price || 0,
      bulk_price: product.bulk_price,
      stock: product.stock || 0,
      min_order: product.minimum_order || 1,
      condition: product.condition,
      quality: product.quality,
      warranty: product.warranty,
      status: product.status || "ACTIVE",
      featured: product.featured || false,
      premium: product.premium || false,
      images: (product.images || []).map((img: any) => img.image_url),
      created_at: product.created_at,
      updated_at: product.updated_at,
    }))

    const totalPages = Math.ceil((count || 0) / pageSize)

    console.log("Admin Products - Successfully formatted products, returning:", formattedProducts.length)

    return {
      data: formattedProducts,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.max(1, totalPages),
    }
  } catch (error) {
    console.error("Admin Products - getAdminProducts caught error:", error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }
}

/**
 * Get all brands for filter dropdown
 */
export async function getAdminBrands(): Promise<Array<{ id: string; name: string }>> {
  try {
    console.log("Admin Products - Starting getAdminBrands")
    const { data, error } = await supabaseAdmin
      .from("brands")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) {
      console.error("Admin Products - Brands query failed:", error)
      return []
    }

    console.log("Admin Products - Brands query successful, count:", data?.length)
    return data || []
  } catch (error) {
    console.error("Admin Products - getAdminBrands caught error:", error)
    return []
  }
}

/**
 * Get all categories for filter dropdown
 */
export async function getAdminCategories(): Promise<Array<{ id: string; name: string }>> {
  try {
    console.log("Admin Products - Starting getAdminCategories")
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) {
      console.error("Admin Products - Categories query failed:", error)
      return []
    }

    console.log("Admin Products - Categories query successful, count:", data?.length)
    return data || []
  } catch (error) {
    console.error("Admin Products - getAdminCategories caught error:", error)
    return []
  }
}

/**
 * Get all dealers for filter dropdown
 */
export async function getAdminDealers(): Promise<Array<{ id: string; business_name: string }>> {
  try {
    console.log("Admin Products - Starting getAdminDealers")
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, business_name, name")
      .eq("role", "DEALER")
      .order("business_name", { ascending: true })

    if (error) {
      console.error("Admin Products - Dealers query failed:", error)
      return []
    }

    console.log("Admin Products - Dealers query successful, count:", data?.length)
    return (data || []).map((dealer: any) => ({
      id: dealer.id,
      business_name: dealer.business_name || dealer.name || "Unknown",
    }))
  } catch (error) {
    console.error("Admin Products - getAdminDealers caught error:", error)
    return []
  }
}

/**
 * Update product status
 */
export async function approveProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    const { data: product } = await (supabaseAdmin
      .from("products") as any)
      .select("title, dealer_id")
      .eq("id", productId)
      .single()
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ 
        status: "APPROVED",
        approved_at: new Date().toISOString(),
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      console.error("Error approving product:", error)
      return { success: false, error: error.message }
    }

    await logProductActivity(
      "Approved product",
      user.id,
      profile.name || user.email || "Unknown",
      profile.role,
      productId,
      product?.title || "Unknown"
    )

    await notifyProductApproved(productId, product?.title || "Unknown", product?.dealer_id)

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in approveProduct:", error)
    return { success: false, error: "Failed to approve product" }
  }
}

export async function rejectProduct(productId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    const { data: product } = await (supabaseAdmin
      .from("products") as any)
      .select("title, dealer_id")
      .eq("id", productId)
      .single()
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ 
        status: "REJECTED",
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      console.error("Error rejecting product:", error)
      return { success: false, error: error.message }
    }

    await logProductActivity(
      "Rejected product",
      user.id,
      profile.name || user.email || "Unknown",
      profile.role,
      productId,
      product?.title || "Unknown"
    )

    await notifyProductRejected(productId, product?.title || "Unknown", product?.dealer_id, reason)

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in rejectProduct:", error)
    return { success: false, error: "Failed to reject product" }
  }
}

export async function suspendProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    const { data: product } = await (supabaseAdmin
      .from("products") as any)
      .select("title, dealer_id")
      .eq("id", productId)
      .single()
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ 
        status: "SUSPENDED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      console.error("Error suspending product:", error)
      return { success: false, error: error.message }
    }

    await logProductActivity(
      "Suspended product",
      user.id,
      profile.name || user.email || "Unknown",
      profile.role,
      productId,
      product?.title || "Unknown"
    )

    await notifyProductSuspended(productId, product?.title || "Unknown", product?.dealer_id)

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in suspendProduct:", error)
    return { success: false, error: "Failed to suspend product" }
  }
}

export async function deactivateProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    const { data: product } = await (supabaseAdmin
      .from("products") as any)
      .select("title, dealer_id")
      .eq("id", productId)
      .single()
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ 
        status: "INACTIVE",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      console.error("Error deactivating product:", error)
      return { success: false, error: error.message }
    }

    await logProductActivity(
      "Deactivated product",
      user.id,
      profile.name || user.email || "Unknown",
      profile.role,
      productId,
      product?.title || "Unknown"
    )

    await notifyProductDeactivated(productId, product?.title || "Unknown", product?.dealer_id)

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in deactivateProduct:", error)
    return { success: false, error: "Failed to deactivate product" }
  }
}

export async function updateProductStatus(
  productId: string,
  status: "APPROVED" | "INACTIVE" | "SUSPENDED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    const { data: product } = await (supabaseAdmin
      .from("products") as any)
      .select("title, dealer_id")
      .eq("id", productId)
      .single()
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", productId)

    if (error) {
      console.error("Error updating product status:", error)
      return { success: false, error: error.message }
    }

    await logProductActivity(
      `Updated product status to ${status}`,
      user.id,
      profile.name || user.email || "Unknown",
      profile.role,
      productId,
      product?.title || "Unknown"
    )

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in updateProductStatus:", error)
    return { success: false, error: "Failed to update product status" }
  }
}

/**
 * Toggle product featured status
 */
export async function toggleProductFeatured(productId: string): Promise<{ success: boolean; error?: string }> {
  console.log("=== FEATURED TOGGLE START ===", { productId })
  
  try {
    const { user, profile } = await requireAdmin()
    const { data: product, error: selectError } = await supabaseAdmin
      .from("products")
      .select("title, featured, dealer_id")
      .eq("id", productId)
      .single()
    
    if (selectError) {
      console.error("FEATURED SELECT FAILED", {
        productId,
        errorMessage: selectError.message,
        errorCode: selectError.code,
        errorDetails: selectError.details,
        errorHint: selectError.hint,
      })
      return { success: false, error: selectError.message }
    }
    
    const newFeaturedStatus = !product?.featured
    
    console.log("FEATURED TOGGLE: current state", {
      productId,
      currentFeatured: product?.featured,
      newFeatured: newFeaturedStatus,
    })
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ 
        featured: newFeaturedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      console.error("FEATURED UPDATE FAILED", {
        productId,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
      })
      return { success: false, error: error.message }
    }

    console.log("FEATURED TOGGLE: database update successful", {
      productId,
      newFeatured: newFeaturedStatus,
    })

    // Log activity - don't let this failure cause the whole operation to fail
    try {
      await logActivity({
        type: "PRODUCT_ACTION",
        action: newFeaturedStatus ? "Featured product" : "Unfeatured product",
        actor_id: user.id,
        actor_name: profile.name || user.email,
        actor_role: profile.role,
        target_type: "product",
        target_id: productId,
        target_name: product?.title || "Unknown",
      })
    } catch (activityError) {
      console.error("Featured activity logging failed", activityError)
      // Don't fail the operation - DB update succeeded
    }

    // Revalidate paths - don't let this failure cause the whole operation to fail
    try {
      revalidatePath("/")
      revalidatePath("/products")
    } catch (revalidationError) {
      console.error("Featured revalidation failed", revalidationError)
      // Don't fail the operation - DB update succeeded
    }

    console.log("FEATURED TOGGLE COMPLETE SUCCESS", {
      productId,
      newFeatured: newFeaturedStatus,
    })

    return { success: true }
  } catch (error) {
    console.error("Error in toggleProductFeatured:", error)
    return { success: false, error: "Failed to toggle product featured status" }
  }
}

/**
 * Toggle product premium status
 */
export async function toggleProductPremium(productId: string): Promise<{ success: boolean; error?: string }> {
  console.log("=== toggleProductPremium CALLED ===", { productId })
  
  try {
    console.log("toggleProductPremium START", { productId })
    
    const { user, profile } = await requireAdmin()
    console.log("toggleProductPremium ADMIN CHECK PASSED", { userId: user.id })
    
    const { data: product, error: selectError } = await supabaseAdmin
      .from("products")
      .select("title, premium, dealer_id")
      .eq("id", productId)
      .single()
    
    if (selectError) {
      console.error("toggleProductPremium SELECT FAILED", {
        productId,
        errorMessage: selectError.message,
        errorCode: selectError.code,
        errorDetails: selectError.details,
        errorHint: selectError.hint,
      })
      return { success: false, error: selectError.message }
    }
    
    console.log("toggleProductPremium PRODUCT DATA", {
      productId,
      currentPremium: product?.premium,
      title: product?.title,
    })
    
    const newPremiumStatus = !product?.premium
    
    console.log("toggleProductPremium UPDATE", {
      productId,
      newPremiumStatus,
    })
    
    const { error } = await (supabaseAdmin
      .from("products") as any)
      .update({ 
        premium: newPremiumStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)

    if (error) {
      console.error("toggleProductPremium UPDATE FAILED", {
        productId,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        errorObject: error,
      })
      return { success: false, error: error.message }
    }

    console.log("toggleProductPremium DB UPDATE SUCCESS", {
      productId,
      newPremiumStatus,
    })

    // Log activity - don't let this failure cause the whole operation to fail
    try {
      console.log("toggleProductPremium LOGGING ACTIVITY START")
      await logActivity({
        type: "PRODUCT_ACTION",
        action: newPremiumStatus ? "Marked product as premium" : "Unmarked product as premium",
        actor_id: user.id,
        actor_name: profile.name || user.email,
        actor_role: profile.role,
        target_type: "product",
        target_id: productId,
        target_name: product?.title || "Unknown",
      })
      console.log("toggleProductPremium LOGGING ACTIVITY SUCCESS")
    } catch (activityError) {
      console.error("toggleProductPremium ACTIVITY LOGGING FAILED", {
        productId,
        errorMessage: activityError instanceof Error ? activityError.message : undefined,
        errorObject: activityError,
      })
      // Don't fail the operation - DB update succeeded
    }

    // Revalidate paths - don't let this failure cause the whole operation to fail
    try {
      console.log("toggleProductPremium REVALIDATION START")
      revalidatePath("/")
      revalidatePath("/products")
      console.log("toggleProductPremium REVALIDATION SUCCESS")
    } catch (revalidationError) {
      console.error("toggleProductPremium REVALIDATION FAILED", {
        productId,
        errorMessage: revalidationError instanceof Error ? revalidationError.message : undefined,
        errorObject: revalidationError,
      })
      // Don't fail the operation - DB update succeeded
    }

    console.log("toggleProductPremium COMPLETE SUCCESS", {
      productId,
      newPremiumStatus,
    })

    return { success: true }
  } catch (error) {
    console.error("toggleProductPremium CATCH ERROR", {
      productId,
      errorMessage: error instanceof Error ? error.message : undefined,
      errorCode: (error as any)?.code,
      errorDetails: (error as any)?.details,
      errorHint: (error as any)?.hint,
      errorObject: error,
    })
    return { success: false, error: "Failed to toggle product premium status" }
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    const { data: product } = await supabaseAdmin.from("products").select("title").eq("id", productId).single()
    
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return { success: false, error: error.message }
    }

    await logActivity({
      type: "PRODUCT_ACTION",
      action: "Deleted product",
      actor_id: user.id,
      actor_name: profile.name || user.email,
      actor_role: profile.role,
      target_type: "product",
      target_id: productId,
      target_name: product?.title || "Unknown",
    })

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

/**
 * Bulk update product status
 */
export async function bulkUpdateProductStatus(
  productIds: string[],
  status: "APPROVED" | "INACTIVE" | "SUSPENDED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    
    const { error } = await supabaseAdmin
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", productIds)

    if (error) {
      console.error("Error bulk updating product status:", error)
      return { success: false, error: error.message }
    }

    await logActivity({
      type: "PRODUCT_ACTION",
      action: `Bulk updated ${productIds.length} products to ${status}`,
      actor_id: user.id,
      actor_name: profile.name || user.email,
      actor_role: profile.role,
      target_type: "product",
      target_id: null,
      target_name: `${productIds.length} products`,
    })

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in bulkUpdateProductStatus:", error)
    return { success: false, error: "Failed to update product statuses" }
  }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, profile } = await requireAdmin()
    
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", productIds)

    if (error) {
      console.error("Error bulk deleting products:", error)
      return { success: false, error: error.message }
    }

    await logActivity({
      type: "PRODUCT_ACTION",
      action: `Bulk deleted ${productIds.length} products`,
      actor_id: user.id,
      actor_name: profile.name || user.email,
      actor_role: profile.role,
      target_type: "product",
      target_id: null,
      target_name: `${productIds.length} products`,
    })

    revalidatePath("/")
    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error in bulkDeleteProducts:", error)
    return { success: false, error: "Failed to delete products" }
  }
}

/**
 * Get product by ID
 */
export async function getAdminProductById(productId: string): Promise<AdminProduct | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        title,
        slug,
        description,
        brand_id,
        category_id,
        model_id,
        dealer_id,
        price,
        bulk_price,
        stock,
        minimum_order,
        condition,
        quality,
        warranty,
        status,
        featured,
        premium,
        created_at,
        updated_at,
        dealer:profiles(business_name, email),
        brand:brands(name),
        category:categories(name),
        model:models(name),
        images:product_images(image_url)
      `)
      .eq("id", productId)
      .single()

    if (error || !data) {
      console.error("Error fetching product:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description || "",
      brand_id: data.brand_id,
      brand_name: data.brand?.name || "",
      category_id: data.category_id,
      category_name: data.category?.name || "",
      model_id: data.model_id,
      model_name: data.model?.name || "",
      dealer_id: data.dealer_id,
      dealer_name: data.dealer?.business_name || data.dealer?.name || "Unknown",
      dealer_email: data.dealer?.email || "",
      price: data.price || 0,
      bulk_price: data.bulk_price,
      stock: data.stock || 0,
      min_order: data.minimum_order || 1,
      condition: data.condition,
      quality: data.quality,
      warranty: data.warranty,
      status: data.status || "ACTIVE",
      featured: data.featured || false,
      premium: data.premium || false,
      images: (data.images || []).map((img: any) => img.image_url),
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  } catch (error) {
    console.error("Error in getAdminProductById:", error)
    return null
  }
}
