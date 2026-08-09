import { z } from "zod"

export const dealerProfileSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  gst_number: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  pincode: z.string().min(6, "Pincode must be at least 6 characters"),
  business_description: z.string().optional(),
  profile_image: z.string().optional(),
})

export type DealerProfileFormData = z.infer<typeof dealerProfileSchema>
