export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED"

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export const orderStatusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PACKED", label: "Packed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
  { value: "REFUNDED", label: "Refunded" },
]

export function statusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    PACKED: "bg-violet-100 text-violet-700",
    SHIPPED: "bg-sky-100 text-sky-700",
    DELIVERED: "bg-teal-100 text-teal-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-rose-100 text-rose-700",
    RETURNED: "bg-orange-100 text-orange-700",
    REFUNDED: "bg-slate-100 text-slate-700",
  }
  return map[status]
}

export function paymentColor(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-rose-100 text-rose-700",
    REFUNDED: "bg-slate-100 text-slate-700",
  }
  return map[status]
}
