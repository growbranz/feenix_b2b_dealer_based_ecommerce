import { notFound, redirect } from "next/navigation"
import { BuyerEnquiryDetail } from "@/components/dealer/enquiries/buyer-enquiry-detail"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getBuyerEnquiryDetail } from "@/lib/enquiries/buyer-service"
import { createServerClient } from "@/lib/supabase/server"

export default async function BuyerEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const buyerId = userProfile.profile.id
  const enquiry = await getBuyerEnquiryDetail(buyerId, id)

  if (!enquiry) {
    console.error("Buyer enquiry detail not found or not owned", {
      enquiryId: id,
      buyerId,
    })
    notFound()
  }

  // Fetch seller information
  const supabase: any = await createServerClient()
  const { data: enquiryData, error: sellerError } = await supabase
    .from("enquiries")
    .select("seller:profiles!seller_id(id, name, business_name, email, phone)")
    .eq("id", id)
    .single()

  if (sellerError) {
    console.error("Buyer enquiry detail seller query error:", {
      enquiryId: id,
      code: sellerError?.code,
      message: sellerError?.message,
      details: sellerError?.details,
      hint: sellerError?.hint,
    })
  }

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