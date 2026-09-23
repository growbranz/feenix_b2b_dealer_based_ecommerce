import { createServerClient } from "@/lib/supabase/server"
import type { Testimonial } from "@/types"

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) throw error
    return (data || []) as Testimonial[]
  } catch (error) {
    console.error("Failed to fetch testimonials:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    })
    return []
  }
}
