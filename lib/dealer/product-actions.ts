"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { slugify } from "@/lib/utils"
import { logProductActivity } from "@/lib/notifications/dealer-product-notifications"
import {
  notifyProductSubmitted,
} from "@/lib/notifications/dealer-product-notifications"

/**
 * Create a new product as DRAFT
 * Only verified dealers can create products
 */
export async function createProduct(data: any): Promise<{ success: boolean; error?: string; productId?: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "You must be logged in to create a product" }
  }

  // Check if dealer is verified
  const { data: profile, error: profileError } = await (supabase
    .from("profiles") as any)
    .select("dealer_status, role, name, business_name")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Failed to fetch your profile" }
  }

  if (profile.role !== "DEALER") {
    return { success: false, error: "Only dealers can create products" }
  }

  if (profile.dealer_status !== "VERIFIED") {
    return { 
      success: false, 
      error: `Your dealer account is ${profile.dealer_status}. Only verified dealers can create products.` 
    }
  }

  // Create product with DRAFT status
  const productPayload = {
    dealer_id: user.id,
    category_id: data.category_id,
    brand_id: data.brand_id,
    model_id: data.model_id,
    title: data.title,
    slug: slugify(data.title),
    sku: data.sku,
    oem_number: data.oem_number || null,
    compatible_models: data.compatible_models || null,
    description: data.description,
    price: data.price,
    bulk_price: typeof data.bulk_price === "number" && !Number.isNaN(data.bulk_price) ? data.bulk_price : null,
    stock: data.stock,
    minimum_order: data.minimum_order,
    condition: data.condition || null,
    quality: data.quality || null,
    warranty: data.warranty || null,
    status: "DRAFT", // Always start as DRAFT
    featured: false,
  }

  const { data: product, error } = await (supabase
    .from("products") as any)
    .insert([productPayload])
    .select()
    .single()

  if (error) {
    console.error("Product creation error:", error)
    return { success: false, error: error.message || "Failed to create product" }
  }

  // Log activity
  await logProductActivity(
    "Created product draft",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    product.id,
    product.title
  )

  // Handle images if provided
  if (data.images && data.images.length > 0) {
    console.log("PRODUCT IMAGES STEP START", {
      productId: product.id,
      imageCount: data.images.length,
    })

    const imagePayloads = data.images.map((img: string, index: number) => ({
      product_id: product.id,
      image_url: img, // Direct URL string from Supabase Storage
      display_order: index,
    }))

    console.log("PRODUCT IMAGES INSERT", {
      productId: product.id,
      payloads: imagePayloads,
    })

    const { error: imagesError } = await (supabase
      .from("product_images") as any)
      .insert(imagePayloads)

    if (imagesError) {
      console.error("PRODUCT IMAGES INSERT FAILED", {
        productId: product.id,
        errorMessage: imagesError.message,
        errorCode: imagesError.code,
        errorDetails: imagesError.details,
        errorHint: imagesError.hint,
      })
      return { success: false, error: `Failed to save product images: ${imagesError.message}` }
    }

    console.log("PRODUCT IMAGES INSERT SUCCESS", {
      productId: product.id,
      imageCount: imagePayloads.length,
    })
  }

  revalidatePath("/dealer/products")
  
  return { success: true, productId: product.id }
}

/**
 * Submit product for approval (DRAFT -> PENDING_APPROVAL)
 */
export async function submitProductForApproval(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "You must be logged in" }
  }

  // Get product and dealer info
  const { data: product, error: productError } = await (supabase
    .from("products") as any)
    .select("*, dealer:profiles(name, business_name)")
    .eq("id", productId)
    .eq("dealer_id", user.id)
    .single()

  if (productError || !product) {
    return { success: false, error: "Product not found or you don't have permission" }
  }

  if (product.status !== "DRAFT") {
    return { success: false, error: "Only draft products can be submitted for approval" }
  }

  // Update status to PENDING_APPROVAL
  const { error: updateError } = await (supabase
    .from("products") as any)
    .update({ 
      status: "PENDING_APPROVAL",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (updateError) {
    return { success: false, error: updateError.message || "Failed to submit product" }
  }

  // Log activity
  await logProductActivity(
    "Submitted product for approval",
    user.id,
    product.dealer?.name || user.email || "Unknown",
    "DEALER",
    productId,
    product.title
  )

  // Notify admins
  await notifyProductSubmitted(
    productId,
    product.title,
    user.id,
    product.dealer?.business_name || "Unknown"
  )

  revalidatePath("/dealer/products")
  
  return { success: true }
}

/**
 * Update product (only if dealer is verified)
 * If product was APPROVED, significant changes should reset to PENDING_APPROVAL
 */
export async function updateProduct(productId: string, data: any): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "You must be logged in" }
  }

  // Check if dealer is verified
  const { data: profile, error: profileError } = await (supabase
    .from("profiles") as any)
    .select("dealer_status, role, name")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Failed to fetch your profile" }
  }

  if (profile.role !== "DEALER") {
    return { success: false, error: "Only dealers can update products" }
  }

  if (profile.dealer_status !== "VERIFIED") {
    return { 
      success: false, 
      error: `Your dealer account is ${profile.dealer_status}. Only verified dealers can update products.` 
    }
  }

  // Get current product
  const { data: currentProduct, error: productError } = await (supabase
    .from("products") as any)
    .select("status, title")
    .eq("id", productId)
    .eq("dealer_id", user.id)
    .single()

  if (productError || !currentProduct) {
    return { success: false, error: "Product not found or you don't have permission" }
  }

  // Determine new status
  let newStatus = currentProduct.status
  if (currentProduct.status === "APPROVED") {
    // If editing an approved product, reset to PENDING_APPROVAL for review
    newStatus = "PENDING_APPROVAL"
  } else if (currentProduct.status === "REJECTED") {
    // If editing a rejected product, submit for review again
    newStatus = "PENDING_APPROVAL"
  }

  // Update product
  const updatePayload = {
    category_id: data.category_id,
    brand_id: data.brand_id,
    model_id: data.model_id,
    title: data.title,
    slug: slugify(data.title),
    sku: data.sku,
    oem_number: data.oem_number || null,
    compatible_models: data.compatible_models || null,
    description: data.description,
    price: data.price,
    bulk_price: typeof data.bulk_price === "number" && !Number.isNaN(data.bulk_price) ? data.bulk_price : null,
    stock: data.stock,
    minimum_order: data.minimum_order,
    condition: data.condition || null,
    quality: data.quality || null,
    warranty: data.warranty || null,
    status: newStatus,
    submitted_at: newStatus === "PENDING_APPROVAL" ? new Date().toISOString() : null,
  }

  const { error: updateError } = await (supabase
    .from("products") as any)
    .update(updatePayload)
    .eq("id", productId)

  if (updateError) {
    return { success: false, error: updateError.message || "Failed to update product" }
  }

  // Log activity
  await logProductActivity(
    newStatus === "PENDING_APPROVAL" ? "Updated product and resubmitted for approval" : "Updated product draft",
    user.id,
    profile.name || user.email || "Unknown",
    profile.role,
    productId,
    data.title
  )

  // If resubmitted, notify admins
  if (newStatus === "PENDING_APPROVAL") {
    const { data: dealer } = await (supabase
      .from("profiles") as any)
      .select("business_name")
      .eq("id", user.id)
      .single()

    await notifyProductSubmitted(
      productId,
      data.title,
      user.id,
      dealer?.business_name || "Unknown"
    )
  }

  revalidatePath("/dealer/products")
  
  return { success: true }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { success: false, error: "You must be logged in" }
  }

  // Get product info for logging
  const { data: product, error: productError } = await (supabase
    .from("products") as any)
    .select("title, dealer_id")
    .eq("id", productId)
    .single()

  if (productError || !product) {
    return { success: false, error: "Product not found" }
  }

  if (product.dealer_id !== user.id) {
    return { success: false, error: "You don't have permission to delete this product" }
  }

  // Get profile for logging
  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("name, role")
    .eq("id", user.id)
    .single()

  // Delete product
  const { error: deleteError } = await (supabase
    .from("products") as any)
    .delete()
    .eq("id", productId)

  if (deleteError) {
    return { success: false, error: deleteError.message || "Failed to delete product" }
  }

  // Log activity
  await logProductActivity(
    "Deleted product",
    user.id,
    profile?.name || user.email || "Unknown",
    profile?.role || "DEALER",
    productId,
    product.title
  )

  revalidatePath("/dealer/products")
  
  return { success: true }
}
