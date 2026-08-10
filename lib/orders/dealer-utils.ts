import type { PaymentStatus } from "@/types/orders"

/**
 * Maps a payment_status enum value (which includes the full Razorpay
 * lifecycle: PENDING, CREATED, AUTHORIZED, CAPTURED, PAID, FAILED,
 * CANCELLED, REFUNDED, PARTIALLY_REFUNDED) down to the four states the
 * Dealer Orders UI displays: PENDING, COMPLETED, FAILED, REFUNDED.
 */
export function toDisplayPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "PAID":
    case "CAPTURED":
      return "COMPLETED"
    case "FAILED":
    case "CANCELLED":
      return "FAILED"
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "REFUNDED"
    default:
      return "PENDING"
  }
}
