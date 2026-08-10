import { redirect } from "next/navigation"
import { DealerEnquiryList } from "@/components/dealer/enquiries/dealer-enquiry-list"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { getDealerEnquiries } from "@/lib/enquiries/dealer-service"

export default async function MyEnquiriesPage() {
  const userProfile = await getCurrentUserProfile()
  if (!userProfile?.profile?.id) redirect("/auth/login")

  const dealerId = userProfile.profile.id
  const { data: enquiries } = await getDealerEnquiries(dealerId, { limit: 1000 })

  return <DealerEnquiryList initialEnquiries={enquiries} />
}
