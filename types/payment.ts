import type { Payment, Invoice, Order, Profile, Product } from "@/types"

export interface PaymentWithDetails extends Payment {
  order: {
    order_number: string
    buyer: { name: string; email: string } | null
    seller: { name: string; business_name: string | null } | null
    product: { title: string; sku: string | null } | null
  } | null
  invoice: { invoice_number: string } | null
}

export interface InvoiceWithDetails extends Invoice {
  customer: { name: string; email: string } | null
  dealer: { name: string; business_name: string | null } | null
  product: { title: string; sku: string | null } | null
  order: { order_number: string } | null
}

export interface PaymentFilterOptions {
  search?: string
  dealerId?: string
  customerId?: string
  status?: string
  method?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface PaymentStats {
  revenue: number
  todayRevenue: number
  monthlyRevenue: number
  pending: number
  successful: number
  failed: number
  refunds: number
  count: number
}

export interface DealerPaymentStats {
  sales: number
  completed: number
  pendingSettlements: number
  refunds: number
  count: number
}

export interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  retry: {
    enabled: boolean
    max_count: number
  }
  notes: Record<string, string>
  modal?: {
    ondismiss?: () => void
  }
  handler?: (response: RazorpayPaymentResponse) => void
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface PaymentReportRow {
  date: string
  revenue: number
  refunds: number
  successful: number
  failed: number
  pending: number
}
