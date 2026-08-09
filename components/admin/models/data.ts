import { mockBrands } from "@/components/admin/brands/data"

export type ModelStatus = "ACTIVE" | "INACTIVE"

export interface AdminModel {
  id: string
  name: string
  slug: string
  brand_id: string
  category_id: string
  description: string
  compatible_products: string
  status: ModelStatus
  created_at: string
}

export const mockModels: AdminModel[] = [
  {
    id: "1",
    name: "iPhone 14 Pro",
    slug: "iphone-14-pro",
    brand_id: mockBrands[0].id,
    category_id: "1",
    description: "Apple iPhone 14 Pro series",
    compatible_products: "iPhone 14 Pro, iPhone 14 Pro Max",
    status: "ACTIVE",
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "2",
    name: "Galaxy S23 Ultra",
    slug: "galaxy-s23-ultra",
    brand_id: mockBrands[1].id,
    category_id: "2",
    description: "Samsung Galaxy S23 Ultra",
    compatible_products: "Galaxy S23 Ultra, Galaxy S23+",
    status: "ACTIVE",
    created_at: "2026-02-05T08:00:00Z",
  },
  {
    id: "3",
    name: "OnePlus 11",
    slug: "oneplus-11",
    brand_id: mockBrands[2].id,
    category_id: "3",
    description: "OnePlus 11 5G",
    compatible_products: "OnePlus 11",
    status: "ACTIVE",
    created_at: "2026-02-10T08:00:00Z",
  },
  {
    id: "4",
    name: "Xiaomi 13",
    slug: "xiaomi-13",
    brand_id: mockBrands[3].id,
    category_id: "1",
    description: "Xiaomi 13 series",
    compatible_products: "Xiaomi 13, Xiaomi 13 Pro",
    status: "INACTIVE",
    created_at: "2026-03-12T08:00:00Z",
  },
]

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
