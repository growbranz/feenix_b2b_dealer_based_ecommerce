export type CategoryStatus = "ACTIVE" | "INACTIVE"

export interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string
  status: CategoryStatus
  parent_id: string | null
  icon_url: string | null
  image_url: string | null
  meta_title: string
  meta_description: string
  display_order: number
  created_at: string
}

export const mockCategories: AdminCategory[] = [
  {
    id: "1",
    name: "Displays",
    slug: "displays",
    description: "Mobile phone and tablet displays",
    status: "ACTIVE",
    parent_id: null,
    icon_url: null,
    image_url: null,
    meta_title: "Displays - Feenix Repair",
    meta_description: "Buy mobile displays wholesale",
    display_order: 1,
    created_at: "2026-01-10T08:00:00Z",
  },
  {
    id: "2",
    name: "Batteries",
    slug: "batteries",
    description: "Original and replacement batteries",
    status: "ACTIVE",
    parent_id: null,
    icon_url: null,
    image_url: null,
    meta_title: "Batteries - Feenix Repair",
    meta_description: "Buy mobile batteries wholesale",
    display_order: 2,
    created_at: "2026-01-12T08:00:00Z",
  },
  {
    id: "3",
    name: "Charging Ports",
    slug: "charging-ports",
    description: "USB and charging connectors",
    status: "ACTIVE",
    parent_id: null,
    icon_url: null,
    image_url: null,
    meta_title: "Charging Ports - Feenix Repair",
    meta_description: "Buy charging ports wholesale",
    display_order: 3,
    created_at: "2026-01-15T08:00:00Z",
  },
  {
    id: "4",
    name: "OLED Displays",
    slug: "oled-displays",
    description: "High-end OLED panels",
    status: "ACTIVE",
    parent_id: "1",
    icon_url: null,
    image_url: null,
    meta_title: "OLED Displays - Feenix Repair",
    meta_description: "Buy OLED displays wholesale",
    display_order: 1,
    created_at: "2026-02-10T08:00:00Z",
  },
  {
    id: "5",
    name: "LCD Displays",
    slug: "lcd-displays",
    description: "Standard LCD panels",
    status: "INACTIVE",
    parent_id: "1",
    icon_url: null,
    image_url: null,
    meta_title: "LCD Displays - Feenix Repair",
    meta_description: "Buy LCD displays wholesale",
    display_order: 2,
    created_at: "2026-02-12T08:00:00Z",
  },
]

export const statusOptions: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
]

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
