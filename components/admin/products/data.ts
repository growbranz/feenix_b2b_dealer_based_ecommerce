import { mockBrands } from "@/components/admin/brands/data"

export type ProductStatus = "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED"

export interface ProductSpecification {
  label: string
  value: string
}

export interface ApprovalEvent {
  action: string
  by: string
  timestamp: string
  reason?: string
}

export interface ProductComment {
  id: string
  author: string
  text: string
  timestamp: string
}

export interface AdminProduct {
  id: string
  title: string
  slug: string
  description: string
  brand_id: string
  category_id: string
  model_id: string
  dealer_id: string
  dealer_name: string
  dealer_email: string
  price: number
  bulk_price: number | null
  stock: number
  min_order: number
  condition: string
  warranty: string
  status: ProductStatus
  images: string[]
  specifications: ProductSpecification[]
  approval_history: ApprovalEvent[]
  comments: ProductComment[]
  created_at: string
  updated_at: string
}

export const mockProducts: AdminProduct[] = [
  {
    id: "p1",
    title: "iPhone 14 Pro OLED Display",
    slug: "iphone-14-pro-oled-display",
    description: "Original OLED display for iPhone 14 Pro. Tested and grade A quality.",
    brand_id: mockBrands[0].id,
    category_id: "1",
    model_id: "1",
    dealer_id: "2",
    dealer_name: "MobileSpares Inc.",
    dealer_email: "priya@mobilespares.in",
    price: 8999,
    bulk_price: 7999,
    stock: 24,
    min_order: 1,
    condition: "New",
    warranty: "6 months",
    status: "PENDING",
    images: [],
    specifications: [
      { label: "Type", value: "OLED" },
      { label: "Resolution", value: "1179 x 2556" },
      { label: "Size", value: "6.1 inch" },
    ],
    approval_history: [
      { action: "Submitted", by: "MobileSpares Inc.", timestamp: "2026-07-20T10:00:00Z" },
    ],
    comments: [],
    created_at: "2026-07-20T10:00:00Z",
    updated_at: "2026-07-20T10:00:00Z",
  },
  {
    id: "p2",
    title: "Samsung S23 Ultra Battery",
    slug: "samsung-s23-ultra-battery",
    description: "Genuine replacement battery for Samsung S23 Ultra.",
    brand_id: mockBrands[1].id,
    category_id: "2",
    model_id: "2",
    dealer_id: "3",
    dealer_name: "PhoneCare Hub",
    dealer_email: "amit@phonecare.com",
    price: 2499,
    bulk_price: 1999,
    stock: 56,
    min_order: 5,
    condition: "New",
    warranty: "3 months",
    status: "APPROVED",
    images: [],
    specifications: [
      { label: "Capacity", value: "5000 mAh" },
      { label: "Type", value: "Li-Ion" },
    ],
    approval_history: [
      { action: "Submitted", by: "PhoneCare Hub", timestamp: "2026-07-18T09:00:00Z" },
      { action: "Approved", by: "Admin", timestamp: "2026-07-19T12:00:00Z" },
    ],
    comments: [{ id: "c1", author: "Admin", text: "Quality looks good.", timestamp: "2026-07-19T12:05:00Z" }],
    created_at: "2026-07-18T09:00:00Z",
    updated_at: "2026-07-19T12:00:00Z",
  },
  {
    id: "p3",
    title: "OnePlus 11 Charging Port",
    slug: "oneplus-11-charging-port",
    description: "USB-C charging port flex for OnePlus 11.",
    brand_id: mockBrands[2].id,
    category_id: "3",
    model_id: "3",
    dealer_id: "2",
    dealer_name: "MobileSpares Inc.",
    dealer_email: "priya@mobilespares.in",
    price: 599,
    bulk_price: null,
    stock: 120,
    min_order: 10,
    condition: "New",
    warranty: "1 month",
    status: "PENDING",
    images: [],
    specifications: [{ label: "Connector", value: "USB-C" }],
    approval_history: [{ action: "Submitted", by: "MobileSpares Inc.", timestamp: "2026-07-21T14:00:00Z" }],
    comments: [],
    created_at: "2026-07-21T14:00:00Z",
    updated_at: "2026-07-21T14:00:00Z",
  },
  {
    id: "p4",
    title: "Xiaomi 13 Rear Camera",
    slug: "xiaomi-13-rear-camera",
    description: "Rear camera module for Xiaomi 13.",
    brand_id: mockBrands[3].id,
    category_id: "3",
    model_id: "4",
    dealer_id: "4",
    dealer_name: "DisplayMax",
    dealer_email: "sneha@displaymax.in",
    price: 3499,
    bulk_price: 2999,
    stock: 8,
    min_order: 1,
    condition: "New",
    warranty: "3 months",
    status: "REJECTED",
    images: [],
    specifications: [{ label: "Megapixels", value: "50 MP" }],
    approval_history: [
      { action: "Submitted", by: "DisplayMax", timestamp: "2026-07-15T08:00:00Z" },
      { action: "Rejected", by: "Admin", timestamp: "2026-07-16T10:00:00Z", reason: "Image quality insufficient" },
    ],
    comments: [{ id: "c2", author: "Admin", text: "Please upload clearer images.", timestamp: "2026-07-16T10:05:00Z" }],
    created_at: "2026-07-15T08:00:00Z",
    updated_at: "2026-07-16T10:00:00Z",
  },
  {
    id: "p5",
    title: "Realme GT Neo 3 Display",
    slug: "realme-gt-neo-3-display",
    description: "LCD display assembly for Realme GT Neo 3.",
    brand_id: "",
    category_id: "1",
    model_id: "",
    dealer_id: "2",
    dealer_name: "MobileSpares Inc.",
    dealer_email: "priya@mobilespares.in",
    price: 1899,
    bulk_price: 1599,
    stock: 45,
    min_order: 5,
    condition: "New",
    warranty: "3 months",
    status: "APPROVED",
    images: [],
    specifications: [{ label: "Type", value: "LCD" }],
    approval_history: [
      { action: "Submitted", by: "MobileSpares Inc.", timestamp: "2026-07-10T08:00:00Z" },
      { action: "Approved", by: "Admin", timestamp: "2026-07-11T09:00:00Z" },
    ],
    comments: [],
    created_at: "2026-07-10T08:00:00Z",
    updated_at: "2026-07-11T09:00:00Z",
  },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
}
