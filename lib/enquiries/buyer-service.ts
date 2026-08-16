"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"

export interface CreateEnquiryInput {
  product_id: string
  quantity: number
  remarks?: string
}

export interface CreateEnquiryResult {
  success: boolean
  error?: string
  enquiryId?: string
}

/**
 * Create a new enquiry from a buyer (dealer) to a seller (product owner).
 * 
 * This function:
 * - Validates the user is authenticated
 * - Prevents self-enquiry (buyer cannot enquire on their own product)
 * - Sets buyer_id to authenticated user
 * - Sets seller_id to product owner's dealer_id
 * - Inserts into public.enquiries with RLS-compliant values
 * - Uses existing RLS policy: enquiries_insert_buyer (buyer_id = auth.uid())
 */
export async function createEnquiry(input: CreateEnquiryInput): Promise<CreateEnquiryResult> {
  try {
    // Get current authenticated user
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return { success: false, error: "You must be logged in to send an enquiry" }
    }

    const buyerId = userProfile.profile.id

    // Validate input
    if (!input.product_id) {
      return { success: false, error: "Product ID is required" }
    }

    if (!input.quantity || input.quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" }
    }

    if (input.quantity && !Number.isInteger(input.quantity)) {
      return { success: false, error: "Quantity must be a whole number" }
    }

    // Get product details to determine seller_id
    const supabase = await createServerClient()
    const supabaseAny1: any = supabase
    const { data: product, error: productError } = await supabaseAny1
      .from("products")
      .select("id, dealer_id, title, status")
      .eq("id", input.product_id)
      .single()

    if (productError || !product) {
      return { success: false, error: "Product not found" }
    }

    // Prevent self-enquiry
    if ((product as any).dealer_id === buyerId) {
      return { success: false, error: "You cannot send an enquiry for your own product" }
    }

    // Check if product is active
    if ((product as any).status !== "ACTIVE") {
      return { success: false, error: "This product is not available for enquiry" }
    }

    // Check for existing enquiry from this buyer for this product
    const supabaseAny2: any = supabase
    const { data: existingEnquiry } = await supabaseAny2
      .from("enquiries")
      .select("id, status")
      .eq("buyer_id", buyerId)
      .eq("product_id", input.product_id)
      .in("status", ["PENDING", "ASSIGNED", "ACCEPTED"])
      .maybeSingle()

    if (existingEnquiry) {
      return { 
        success: false, 
        error: `You already have an ${(existingEnquiry as any).status.toLowerCase()} enquiry for this product` 
      }
    }

    // Insert the enquiry
    // RLS policy: enquiries_insert_buyer allows insertion when buyer_id = auth.uid()
    const supabaseAny3: any = supabase
    const { data: enquiry, error: insertError } = await supabaseAny3
      .from("enquiries")
      .insert({
        buyer_id: buyerId,
        seller_id: (product as any).dealer_id,
        product_id: input.product_id,
        quantity: input.quantity,
        remarks: input.remarks || null,
        status: "PENDING",
        priority: "MEDIUM", // Default priority as per schema
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Error creating enquiry:", insertError)
      return { success: false, error: "Failed to create enquiry. Please try again." }
    }

    // Revalidate product page to show updated state if needed
    revalidatePath(`/products/${(product as any).dealer_id}`)

    return { 
      success: true, 
      enquiryId: (enquiry as any)?.id 
    }

  } catch (error) {
    console.error("Unexpected error in createEnquiry:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}