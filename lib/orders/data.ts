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

export interface OrderItem {
  id: string
  product_name: string
  brand: string
  category: string
  quantity: number
  unit_price: number
  tax: number
  discount: number
}

export interface OrderCustomer {
  name: string
  phone: string
  email: string
  business: string
  city: string
  state: string
  address: string
}

export interface OrderDealer {
  id: string
  name: string
}

export interface OrderTimelineEvent {
  id: string
  status: OrderStatus
  actor: string
  timestamp: string
  note?: string
}

export interface OrderDocument {
  id: string
  type: "INVOICE" | "DISPATCH" | "OTHER"
  name: string
  url: string
  uploaded_at: string
}

export interface Order {
  id: string
  customer: OrderCustomer
  dealer: OrderDealer
  items: OrderItem[]
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string
  subtotal: number
  tax_total: number
  discount_total: number
  shipping_charges: number
  grand_total: number
  timeline: OrderTimelineEvent[]
  documents: OrderDocument[]
  created_at: string
  updated_at: string
  expected_delivery?: string
  courier?: string
  tracking_number?: string
}

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

export const dealerOptions = [
  { id: "1", name: "Feenix Store" },
  { id: "2", name: "MobileSpares Inc." },
  { id: "3", name: "PhoneCare Hub" },
  { id: "4", name: "DisplayMax" },
]

const now = new Date()
const date = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

export const mockOrders: Order[] = [
  {
    id: "ORD-1001",
    customer: { name: "Ravi Kumar", phone: "+91 98765 43210", email: "ravi@mobilecare.in", business: "Mobile Care", city: "Delhi", state: "Delhi", address: "123 Nehru Place" },
    dealer: { id: "2", name: "MobileSpares Inc." },
    items: [
      { id: "i1", product_name: "iPhone 14 Pro OLED Display", brand: "Apple", category: "Displays", quantity: 5, unit_price: 12000, tax: 600, discount: 500 },
      { id: "i2", product_name: "iPhone 14 Pro Battery", brand: "Apple", category: "Batteries", quantity: 5, unit_price: 3500, tax: 175, discount: 0 },
    ],
    status: "PENDING",
    payment_status: "PENDING",
    payment_method: "Razorpay",
    subtotal: 77500,
    tax_total: 3875,
    discount_total: 2500,
    shipping_charges: 500,
    grand_total: 79375,
    timeline: [{ id: "t1", status: "PENDING", actor: "System", timestamp: date(0) }],
    documents: [],
    created_at: date(0),
    updated_at: date(0),
  },
  {
    id: "ORD-1002",
    customer: { name: "Priya Sharma", phone: "+91 99887 76655", email: "priya@phonewala.com", business: "Phone Wala", city: "Mumbai", state: "Maharashtra", address: "456 Andheri East" },
    dealer: { id: "3", name: "PhoneCare Hub" },
    items: [
      { id: "i1", product_name: "Samsung S23 Ultra Battery", brand: "Samsung", category: "Batteries", quantity: 20, unit_price: 2500, tax: 125, discount: 100 },
    ],
    status: "CONFIRMED",
    payment_status: "COMPLETED",
    payment_method: "Bank Transfer",
    subtotal: 50000,
    tax_total: 2500,
    discount_total: 2000,
    shipping_charges: 0,
    grand_total: 50500,
    timeline: [
      { id: "t1", status: "PENDING", actor: "System", timestamp: date(2) },
      { id: "t2", status: "CONFIRMED", actor: "PhoneCare Hub", timestamp: date(1) },
    ],
    documents: [{ id: "d1", type: "INVOICE", name: "invoice-1002.pdf", url: "#", uploaded_at: date(1) }],
    created_at: date(2),
    updated_at: date(1),
  },
  {
    id: "ORD-1003",
    customer: { name: "Amit Verma", phone: "+91 90123 45678", email: "amit@repairhub.in", business: "Repair Hub", city: "Bangalore", state: "Karnataka", address: "789 Indiranagar" },
    dealer: { id: "2", name: "MobileSpares Inc." },
    items: [
      { id: "i1", product_name: "OnePlus 11 Charging Port", brand: "OnePlus", category: "Charging Ports", quantity: 10, unit_price: 450, tax: 22.5, discount: 0 },
    ],
    status: "SHIPPED",
    payment_status: "COMPLETED",
    payment_method: "Razorpay",
    subtotal: 4500,
    tax_total: 225,
    discount_total: 0,
    shipping_charges: 250,
    grand_total: 4975,
    timeline: [
      { id: "t1", status: "PENDING", actor: "System", timestamp: date(5) },
      { id: "t2", status: "CONFIRMED", actor: "MobileSpares Inc.", timestamp: date(4) },
      { id: "t3", status: "PROCESSING", actor: "MobileSpares Inc.", timestamp: date(3) },
      { id: "t4", status: "PACKED", actor: "MobileSpares Inc.", timestamp: date(2) },
      { id: "t5", status: "SHIPPED", actor: "MobileSpares Inc.", timestamp: date(1) },
    ],
    documents: [
      { id: "d1", type: "INVOICE", name: "invoice-1003.pdf", url: "#", uploaded_at: date(2) },
      { id: "d2", type: "DISPATCH", name: "dispatch-1003.pdf", url: "#", uploaded_at: date(1) },
    ],
    courier: "Delhivery",
    tracking_number: "DEL1234567890",
    expected_delivery: date(-2),
    created_at: date(5),
    updated_at: date(1),
  },
  {
    id: "ORD-1004",
    customer: { name: "Sneha Patel", phone: "+91 91234 56789", email: "sneha@displaymax.in", business: "DisplayMax", city: "Ahmedabad", state: "Gujarat", address: "101 CG Road" },
    dealer: { id: "4", name: "DisplayMax" },
    items: [
      { id: "i1", product_name: "Xiaomi 13 Rear Camera", brand: "Xiaomi", category: "Cameras", quantity: 3, unit_price: 1800, tax: 90, discount: 0 },
    ],
    status: "DELIVERED",
    payment_status: "COMPLETED",
    payment_method: "Razorpay",
    subtotal: 5400,
    tax_total: 270,
    discount_total: 0,
    shipping_charges: 100,
    grand_total: 5770,
    timeline: [
      { id: "t1", status: "PENDING", actor: "System", timestamp: date(10) },
      { id: "t2", status: "CONFIRMED", actor: "DisplayMax", timestamp: date(9) },
      { id: "t3", status: "PACKED", actor: "DisplayMax", timestamp: date(8) },
      { id: "t4", status: "SHIPPED", actor: "DisplayMax", timestamp: date(6) },
      { id: "t5", status: "DELIVERED", actor: "DisplayMax", timestamp: date(3) },
    ],
    documents: [{ id: "d1", type: "INVOICE", name: "invoice-1004.pdf", url: "#", uploaded_at: date(8) }],
    created_at: date(10),
    updated_at: date(3),
  },
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
