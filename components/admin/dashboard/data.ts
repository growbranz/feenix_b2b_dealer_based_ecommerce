import type { LucideIcon } from "lucide-react"
import {
  Users,
  UserCheck,
  Clock,
  Package,
  PackageCheck,
  DollarSign,
  ShoppingCart,
  Building2,
  CheckCircle2,
  XCircle,
  Settings,
  Layers,
} from "lucide-react"

export interface AdminStat {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  iconGradient?: "blue" | "green" | "orange" | "red" | "purple" | "indigo"
  trend: {
    value: number
    isPositive: boolean
  }
}

// Mock admin stats removed - now using real data from lib/admin/dashboard-service.ts

export interface AdminActivity {
  id: string
  title: string
  description: string
  time: string
  icon: string
  color: string
}

// Mock recent activities removed - now using real data from lib/admin/dashboard-service.ts

export interface AdminQuickAction {
  title: string
  description: string
  href: string
  icon: LucideIcon
  color: string
}

export const adminQuickActions: AdminQuickAction[] = [
  {
    title: "Approve Dealers",
    description: "Review pending registrations",
    href: "/admin/dealers",
    icon: UserCheck,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Moderate Products",
    description: "Approve or reject listings",
    href: "/admin/products",
    icon: PackageCheck,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "View Orders",
    description: "Check latest order activity",
    href: "/admin/orders",
    icon: ShoppingCart,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Platform Settings",
    description: "Configure global settings",
    href: "/admin/settings",
    icon: Settings,
    color: "bg-violet-500/10 text-violet-600",
  },
]

export interface MonthlyDealerRegistration {
  month: string
  registrations: number
}

export interface ProductApprovalDatum {
  name: string
  value: number
}

export interface OrdersOverviewDatum {
  month: string
  orders: number
  revenue: number
}

// Mock chart data removed - now using real data from lib/admin/dashboard-service.ts

export const ADMIN_CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  tertiary: "#f59e0b",
  quaternary: "#f43f5e",
  quinary: "#8b5cf6",
  senary: "#06b6d4",
}
