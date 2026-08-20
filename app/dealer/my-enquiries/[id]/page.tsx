import { redirect } from "next/navigation"
import { BuyerEnquiryDetail } from "@/components/dealer/enquiries/buyer-enquiry-detail"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getBuyerEnquiryDetail } from "@/lib/enquiries/buyer-service"
import { createServerClient } from "@/lib/supabase/server"

export default async function BuyerEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const enquiry = await getBuyerEnquiryDetail(userProfile.profile.id, id)

  // Fetch seller information
  const supabase: any = await createServerClient()
  const { data: enquiryData } = await supabase
    .from("enquiries")
    .select("seller:profiles!enquiries_seller_id_fkey(id, name, business_name, email, phone)")
    .eq("id", id)
    .single()

  const sellerName = enquiryData?.seller?.name || "Unknown"
  const sellerBusinessName = enquiryData?.seller?.business_name || null
  const sellerEmail = enquiryData?.seller?.email || ""
  const sellerPhone = enquiryData?.seller?.phone || null

  return (
    <BuyerEnquiryDetail 
      initialEnquiry={enquiry} 
      sellerName={sellerName}
      sellerBusinessName={sellerBusinessName}
      sellerEmail={sellerEmail}
      sellerPhone={sellerPhone}
    />
  )
}