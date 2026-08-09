"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { dealerProfileSchema, type DealerProfileFormData } from "@/lib/validations/dealer.validation"
import type { Profile } from "@/types"

export async function updateDealerProfile(
  data: DealerProfileFormData
): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, message: "You must be signed in to update your profile." }
  }

  const parsed = dealerProfileSchema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, message: first?.message || "Invalid profile data." }
  }

  const values: Partial<Omit<Profile, "id" | "created_at">> = {
    business_name: parsed.data.business_name,
    phone: parsed.data.phone,
    address: parsed.data.address,
    city: parsed.data.city,
    state: parsed.data.state,
    country: parsed.data.country,
    pincode: parsed.data.pincode,
    gst_number: parsed.data.gst_number || null,
    business_description: parsed.data.business_description || null,
    profile_image: parsed.data.profile_image || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase
    .from("profiles") as any)
    .update(values)
    .eq("id", user.id)

  if (error) {
    return { success: false, message: error.message || "Failed to save profile." }
  }

  revalidatePath("/dealer")
  revalidatePath("/dealer/profile")

  return { success: true, message: "Profile saved successfully." }
}
