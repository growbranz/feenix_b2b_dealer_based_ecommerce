"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { logActivity } from "@/lib/activity/service"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import { revalidatePath } from "next/cache"

export async function testAction(): Promise<{ success: boolean; message: string }> {
  console.log("=== TEST ACTION CALLED ===")
  return { success: true, message: "Test action works" }
}

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
