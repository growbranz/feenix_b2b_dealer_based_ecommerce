import type { LucideIcon } from "lucide-react"

export interface DealerSidebarItem {
  title: string
  href?: string
  icon: LucideIcon
  badge?: number
  comingSoon?: boolean
}

export interface DashboardStat {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export type RecentProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "PENDING"

export interface RecentProduct {
  id: string
  title: string
  image?: string | null
  brand: string
  model: string
  category: string
  stock: number
  status: RecentProductStatus
}

export interface MonthlyUpload {
  month: string
  uploads: number
}

export interface ProductStatusDatum {
  name: string
  value: number
}

export interface InventoryDatum {
  category: string
  stock: number
}

export interface QuickActionItem {
  title: string
  description: string
  href: string
  icon: LucideIcon
  color: string
}
