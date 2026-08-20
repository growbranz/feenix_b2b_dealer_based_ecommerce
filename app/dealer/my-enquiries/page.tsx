import { redirect } from "next/navigation"
import { BuyerEnquiryList } from "@/components/dealer/enquiries/buyer-enquiry-list"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getBuyerEnquiries } from "@/lib/enquiries/buyer-service"
import { createServerClient } from "@/lib/supabase/server"

export default async function MyEnquiriesPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const buyerId = userProfile.profile.id
  const { data: enquiries } = await getBuyerEnquiries(buyerId, { limit: 1000 })

  // Fetch seller names for each enquiry
  const supabase: any = await createServerClient()
  const enquiryIds = enquiries.map((e) => e.id)
  
  const sellerNames: Record<string, string> = {}
  
  if (enquiryIds.length > 0) {
    const { data: enquiriesWithSellers } = await supabase
      .from("enquiries")
      .select("id, seller:profiles!enquiries_seller_id_fkey(id, name, business_name)")
      .in("id", enquiryIds)
    
    if (enquiriesWithSellers) {
      enquiriesWithSellers.forEach((e: any) => {
        sellerNames[e.id] = e.seller?.business_name || e.seller?.name || "Unknown"
      })
    }
  }

  return <BuyerEnquiryList initialEnquiries={enquiries} sellerNames={sellerNames} />
}