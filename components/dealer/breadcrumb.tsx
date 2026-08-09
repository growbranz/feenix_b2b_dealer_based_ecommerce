"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem } from "@/components/shared/breadcrumb"

const SPECIAL_LABELS: Record<string, string> = {
  add: "Add Product",
  products: "My Products",
}

export function DealerBreadcrumb() {
  const pathname = usePathname()
  const parts = pathname.split("/").filter(Boolean)
  const dealerIndex = parts.indexOf("dealer")

  if (dealerIndex === -1) {
    return <Breadcrumb items={[]} />
  }

  const segments = parts.slice(dealerIndex + 1)

  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const label =
      SPECIAL_LABELS[segment] ??
      segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    const href = "/" + parts.slice(0, dealerIndex + index + 2).join("/")
    return { label, href }
  })

  return <Breadcrumb items={items} />
}
