export type BrandStatus = "ACTIVE" | "INACTIVE"

export interface AdminBrand {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  country: string
  website: string
  status: BrandStatus
  featured: boolean
  logo_url: string | null
  created_at: string
}

export const mockBrands: AdminBrand[] = [
  {
    id: "1",
    category_id: "",
    name: "Apple",
    slug: "apple",
    description: "Original Apple parts and components",
    country: "USA",
    website: "https://apple.com",
    status: "ACTIVE",
    featured: true,
    logo_url: null,
    created_at: "2026-01-10T08:00:00Z",
  },
  {
    id: "2",
    category_id: "",
    name: "Samsung",
    slug: "samsung",
    description: "Samsung mobile components",
    country: "South Korea",
    website: "https://samsung.com",
    status: "ACTIVE",
    featured: true,
    logo_url: null,
    created_at: "2026-01-12T08:00:00Z",
  },
  {
    id: "3",
    category_id: "",
    name: "OnePlus",
    slug: "oneplus",
    description: "OnePlus repair parts",
    country: "China",
    website: "https://oneplus.com",
    status: "ACTIVE",
    featured: false,
    logo_url: null,
    created_at: "2026-01-15T08:00:00Z",
  },
  {
    id: "4",
    category_id: "",
    name: "Xiaomi",
    slug: "xiaomi",
    description: "Xiaomi spare parts",
    country: "China",
    website: "https://mi.com",
    status: "INACTIVE",
    featured: false,
    logo_url: null,
    created_at: "2026-03-20T08:00:00Z",
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
