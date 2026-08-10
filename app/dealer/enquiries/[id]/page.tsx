import { redirect } from "next/navigation"
import { DealerEnquiryDetail } from "@/components/dealer/enquiries/dealer-enquiry-detail"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getDealerEnquiryDetail } from "@/lib/enquiries/dealer-service"

export default async function DealerEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const enquiry = await getDealerEnquiryDetail(userProfile.profile.id, id)

  return <DealerEnquiryDetail initialEnquiry={enquiry} />
}
