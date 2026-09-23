"use server"

import { requireAdmin } from "@/lib/auth/auth.helpers"
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  toggleTestimonialStatus,
} from "./service"
import { logActivity, type ActivityType } from "@/lib/activity/service"
import type { Testimonial } from "@/types"
import { revalidatePath } from "next/cache"

export async function getTestimonialsAction(isActive?: boolean) {
  try {
    return getTestimonials({ is_active: isActive })
  } catch (error) {
    console.error("Failed to fetch testimonials:", error)
    return []
  }
}

export async function createTestimonialAction(
  testimonial: Omit<Testimonial, "id" | "created_at" | "updated_at">
) {
  try {
    const { user } = await requireAdmin()
    const created = await createTestimonial(testimonial)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "testimonial_created",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "Testimonial",
        target_id: created.id,
        target_name: created.customer_name,
        metadata: {
          company_name: created.company_name,
          rating: created.rating,
        },
      })
    } catch (logError) {
      console.error("[Testimonials] Activity logging failed (non-critical):", logError)
    }

    // Revalidate homepage to reflect changes
    revalidatePath("/")
    revalidatePath("/admin/testimonials")

    return created
  } catch (error) {
    console.error("[Testimonials] Failed to create testimonial:", error)
    throw error
  }
}

export async function updateTestimonialAction(
  id: string,
  updates: Partial<Omit<Testimonial, "id" | "created_at" | "updated_at">>
) {
  try {
    const { user } = await requireAdmin()
    const updated = await updateTestimonial(id, updates)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "testimonial_updated",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "Testimonial",
        target_id: updated.id,
        target_name: updated.customer_name,
        metadata: {
          company_name: updated.company_name,
          rating: updated.rating,
        },
      })
    } catch (logError) {
      console.error("[Testimonials] Activity logging failed (non-critical):", logError)
    }

    // Revalidate homepage to reflect changes
    revalidatePath("/")
    revalidatePath("/admin/testimonials")

    return updated
  } catch (error) {
    console.error("[Testimonials] Failed to update testimonial:", error)
    throw error
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    const { user } = await requireAdmin()
    const testimonials = await getTestimonials()
    const toDelete = testimonials.find((t) => t.id === id)

    if (!toDelete) {
      throw new Error("Testimonial not found")
    }

    await deleteTestimonial(id)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "testimonial_deleted",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "Testimonial",
        target_id: id,
        target_name: toDelete.customer_name,
        metadata: {
          company_name: toDelete.company_name,
        },
      })
    } catch (logError) {
      console.error("[Testimonials] Activity logging failed (non-critical):", logError)
    }

    // Revalidate homepage to reflect changes
    revalidatePath("/")
    revalidatePath("/admin/testimonials")
  } catch (error) {
    console.error("[Testimonials] Failed to delete testimonial:", error)
    throw error
  }
}

export async function reorderTestimonialsAction(ids: string[]) {
  try {
    const { user } = await requireAdmin()
    await reorderTestimonials(ids)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "testimonial_reordered",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "Testimonial",
        metadata: {
          new_order: ids,
        },
      })
    } catch (logError) {
      console.error("[Testimonials] Activity logging failed (non-critical):", logError)
    }

    // Revalidate homepage to reflect changes
    revalidatePath("/")
    revalidatePath("/admin/testimonials")
  } catch (error) {
    console.error("[Testimonials] Failed to reorder testimonials:", error)
    throw error
  }
}

export async function toggleTestimonialStatusAction(id: string) {
  try {
    const { user } = await requireAdmin()
    const updated = await toggleTestimonialStatus(id)

    // Log activity separately - don't fail the main operation if logging fails
    try {
      await logActivity({
        type: "WEBSITE_ACTION" as ActivityType,
        action: "testimonial_status_changed",
        actor_id: user.id,
        actor_name: user.email,
        actor_role: "ADMIN",
        target_type: "Testimonial",
        target_id: updated.id,
        target_name: updated.customer_name,
        metadata: {
          is_active: updated.is_active,
        },
      })
    } catch (logError) {
      console.error("[Testimonials] Activity logging failed (non-critical):", logError)
    }

    // Revalidate homepage to reflect changes
    revalidatePath("/")
    revalidatePath("/admin/testimonials")

    return updated
  } catch (error) {
    console.error("[Testimonials] Failed to toggle testimonial status:", error)
    throw error
  }
}
