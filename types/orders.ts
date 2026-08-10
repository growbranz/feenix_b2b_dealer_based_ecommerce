import type { OrderStatus } from "@/types"

export type { OrderStatus }

/**
 * The Dealer Orders UI only ever displays these four states (see
 * lib/orders/data.ts). The underlying `payment_status` column supports the
 * full Razorpay lifecycle (CREATED, AUTHORIZED, CAPTURED, PAID, CANCELLED,
 * PARTIALLY_REFUNDED, ...) which is collapsed down via
 * `toDisplayPaymentStatus` before it ever reaches these types.
 */
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export interface DealerOrderCustomer {
  id: string
  name: string
  business_name: string | null
  email: string
  phone: string | null
  city: string | null
  state: string | null
  address: string | null
}

export interface DealerOrderItem {
  id: string
  product_id: string
  product_name: string
  sku: string | null
  quantity: number
  unit_price: number
  tax: number
  discount: number
  subtotal: number
  total: number
}

export interface DealerOrderDocument {
  id: string
  type: "INVOICE" | "DISPATCH" | "OTHER"
  name: string
  url: string | null
  created_at: string
}

export interface DealerOrderTimelineEvent {
  id: string
  status: OrderStatus
  actor: string
  note: string | null
  timestamp: string
}

export interface DealerOrderListItem {
  id: string
  order_number: string
  customer: DealerOrderCustomer
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  item_count: number
  grand_total: number
  created_at: string
  updated_at: string
}

export interface DealerOrderDetail extends DealerOrderListItem {
  items: DealerOrderItem[]
  subtotal: number
  tax_total: number
  discount_total: number
  shipping_charges: number
  courier: string | null
  tracking_number: string | null
  expected_delivery: string | null
  documents: DealerOrderDocument[]
  timeline: DealerOrderTimelineEvent[]
}

export interface DealerOrderFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export interface PaginatedOrders<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}
