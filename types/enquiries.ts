import type { EnquiryPriority, EnquiryStatus } from "@/types"

export type { EnquiryStatus, EnquiryPriority }

export interface DealerEnquiryBuyer {
  id: string
  name: string
  business_name: string | null
  email: string
  phone: string | null
  city: string | null
  state: string | null
  address: string | null
}

export interface DealerEnquiryProduct {
  id: string
  title: string
  sku: string | null
  price: number
  category: string | null
  brand: string | null
  model: string | null
}

export interface DealerEnquiryTimelineEvent {
  id: string
  status: EnquiryStatus
  actor: string
  note: string | null
  timestamp: string
}

export interface DealerEnquiryOrderRef {
  id: string
  order_number: string
  status: string
}

export interface DealerEnquiryListItem {
  id: string
  buyer: DealerEnquiryBuyer
  product: DealerEnquiryProduct
  quantity: number
  remarks: string | null
  status: EnquiryStatus
  priority: EnquiryPriority
  assigned_by: { id: string; name: string } | null
  order: DealerEnquiryOrderRef | null
  created_at: string
  updated_at: string
}

export interface DealerEnquiryDetail extends DealerEnquiryListItem {
  conversationId?: string | null
  latestQuotation?: {
    id: string
    content: string | null
    metadata: any
    sender_id: string | null
    created_at: string
  } | null
  timeline: DealerEnquiryTimelineEvent[]
}

export interface DealerEnquiryFilters {
  search?: string
  status?: string
  priority?: string
  page?: number
  limit?: number
}

export interface PaginatedEnquiries<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}
