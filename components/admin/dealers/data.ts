export type DealerStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED"

export type BusinessType = "Retailer" | "Wholesaler" | "Manufacturer" | "Service Center"

export interface AdminDealer {
  id: string
  business_name: string
  owner_name: string
  business_type: string
  gst: string
  pan: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  status: DealerStatus
  products_count: number
  orders_count: number
  registered_at: string
  logo?: string | null
  rejection_reason?: string | null
}

export const businessTypeColors: Record<string, string> = {
  "—": "bg-slate-100 text-slate-600",
  Retailer: "bg-emerald-500/10 text-emerald-600",
  Wholesaler: "bg-blue-500/10 text-blue-600",
  Manufacturer: "bg-violet-500/10 text-violet-600",
  "Service Center": "bg-amber-500/10 text-amber-600",
}

export const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
]

export interface Activity {
  id: string
  action: string
  timestamp: string
  actor: string
}
