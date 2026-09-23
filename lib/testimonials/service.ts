import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Testimonial } from "@/types"

const db = supabaseAdmin as any

export interface TestimonialsFilterOptions {
  is_active?: boolean
}

export async function getTestimonials(options: TestimonialsFilterOptions = {}): Promise<Testimonial[]> {
  try {
    let query = db
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: true })

    if (options.is_active !== undefined) {
      query = query.eq("is_active", options.is_active)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as Testimonial[]
  } catch (error) {
    console.error("Failed to fetch testimonials:", error)
    return []
  }
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  try {
    const { data, error } = await db
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Testimonial
  } catch (error) {
    console.error("Failed to fetch testimonial:", error)
    return null
  }
}

export async function createTestimonial(
  testimonial: Omit<Testimonial, "id" | "created_at" | "updated_at">
): Promise<Testimonial> {
  const { data, error } = await db
    .from("testimonials")
    .insert(testimonial)
    .select()
    .single()

  if (error) {
    console.error("[Testimonials] Supabase INSERT error:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      customer_name: testimonial.customer_name,
    })
    throw error
  }
  return data as Testimonial
}

export async function updateTestimonial(
  id: string,
  updates: Partial<Omit<Testimonial, "id" | "created_at" | "updated_at">>
): Promise<Testimonial> {
  const { data, error } = await db
    .from("testimonials")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[Testimonials] Supabase UPDATE error:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      id: id,
      updates: updates,
    })
    throw error
  }
  return data as Testimonial
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await db
    .from("testimonials")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function reorderTestimonials(ids: string[]): Promise<void> {
  const updates = ids.map((id, index) => ({
    id,
    display_order: index + 1,
  }))

  const { error } = await db
    .from("testimonials")
    .upsert(updates, { onConflict: "id" })

  if (error) throw error
}

export async function toggleTestimonialStatus(id: string): Promise<Testimonial> {
  const testimonial = await getTestimonialById(id)
  if (!testimonial) throw new Error("Testimonial not found")

  return updateTestimonial(id, { is_active: !testimonial.is_active })
}
