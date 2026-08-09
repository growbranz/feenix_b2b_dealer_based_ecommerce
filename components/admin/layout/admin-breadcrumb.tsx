"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem } from "@/components/shared/breadcrumb"

const SPECIAL_LABELS: Record<string, string> = {
  dealers: "Dealers",
  settings: "Settings",
  products: "Products",
  categories: "Categories",
  brands: "Brands",
  models: "Models",
  cms: "CMS",
  banners: "Banners",
  analytics: "Analytics",
  enquiries: "Enquiries",
  orders: "Orders",
  payments: "Payments",
  inventory: "Inventory",
  reports: "Reports",
  messages: "Messages",
  notifications: "Notifications",
  profile: "Profile",
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const adminIndex = parts.indexOf("admin")

  if (adminIndex === -1) {
    return <Breadcrumb items={[]} />
  }

  const segments = parts.slice(adminIndex + 1)

  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const label =
      SPECIAL_LABELS[segment] ??
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    const href = "/" + parts.slice(0, adminIndex + index + 2).join("/")
    return { label, href }
  })

  return <Breadcrumb items={items} />
}
