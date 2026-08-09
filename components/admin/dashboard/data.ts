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

export const adminStats: AdminStat[] = [
  {
    title: "Total Dealers",
    value: "156",
    description: "Registered dealers on platform",
    icon: Users,
    iconGradient: "blue",
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Active Dealers",
    value: "128",
    description: "Currently active partners",
    icon: UserCheck,
    iconGradient: "green",
    trend: { value: 8, isPositive: true },
  },
  {
    title: "Pending Dealers",
    value: "12",
    description: "Awaiting approval",
    icon: Clock,
    iconGradient: "orange",
    trend: { value: 3, isPositive: true },
  },
  {
    title: "Total Products",
    value: "2,847",
    description: "Products listed across dealers",
    icon: Package,
    iconGradient: "indigo",
    trend: { value: 8, isPositive: true },
  },
  {
    title: "Pending Products",
    value: "48",
    description: "Products awaiting moderation",
    icon: PackageCheck,
    iconGradient: "red",
    trend: { value: 5, isPositive: false },
  },
  {
    title: "Revenue",
    value: "$45,678",
    description: "Total revenue this month",
    icon: DollarSign,
    iconGradient: "purple",
    trend: { value: 22, isPositive: true },
  },
  {
    title: "Monthly Orders",
    value: "1,234",
    description: "Orders processed this month",
    icon: ShoppingCart,
    iconGradient: "blue",
    trend: { value: 15, isPositive: true },
  },
]

export interface AdminActivity {
  id: string
  title: string
  description: string
  time: string
  icon: LucideIcon
  color: string
}

export const recentActivities: AdminActivity[] = [
  {
    id: "1",
    title: "New dealer registration",
    description: "TechFix Solutions submitted registration documents",
    time: "2 min ago",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "2",
    title: "Product approved",
    description: "iPhone 14 Pro display approved by admin",
    time: "15 min ago",
    icon: CheckCircle2,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "3",
    title: "Dealer suspended",
    description: "MobileSpares Inc. account suspended",
    time: "1 hour ago",
    icon: XCircle,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    id: "4",
    title: "Category updated",
    description: "Display category attributes updated",
    time: "3 hours ago",
    icon: Layers,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "5",
    title: "Settings changed",
    description: "Platform commission rate updated",
    time: "5 hours ago",
    icon: Settings,
    color: "bg-slate-500/10 text-slate-600",
  },
]

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

export const monthlyDealerRegistrations: MonthlyDealerRegistration[] = [
  { month: "Jan", registrations: 8 },
  { month: "Feb", registrations: 12 },
  { month: "Mar", registrations: 15 },
  { month: "Apr", registrations: 18 },
  { month: "May", registrations: 22 },
  { month: "Jun", registrations: 20 },
  { month: "Jul", registrations: 26 },
  { month: "Aug", registrations: 24 },
  { month: "Sep", registrations: 30 },
  { month: "Oct", registrations: 35 },
  { month: "Nov", registrations: 28 },
  { month: "Dec", registrations: 38 },
]

export interface ProductApprovalDatum {
  name: string
  value: number
}

export const productApprovalData: ProductApprovalDatum[] = [
  { name: "Approved", value: 2450 },
  { name: "Pending", value: 48 },
  { name: "Rejected", value: 12 },
]

export interface OrdersOverviewDatum {
  month: string
  orders: number
  revenue: number
}

export const ordersOverviewData: OrdersOverviewDatum[] = [
  { month: "Jan", orders: 340, revenue: 12500 },
  { month: "Feb", orders: 420, revenue: 15800 },
  { month: "Mar", orders: 480, revenue: 19200 },
  { month: "Apr", orders: 450, revenue: 17800 },
  { month: "May", orders: 520, revenue: 21500 },
  { month: "Jun", orders: 580, revenue: 24800 },
]

export const ADMIN_CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  tertiary: "#f59e0b",
  quaternary: "#f43f5e",
  quinary: "#8b5cf6",
  senary: "#06b6d4",
}
