import type { DashboardStat, RecentProduct, MonthlyUpload, ProductStatusDatum, InventoryDatum, QuickActionItem } from "./types"
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
  Plus,
  Warehouse,
  User,
  ShoppingCart,
} from "lucide-react"

export const dashboardStats: DashboardStat[] = [
  {
    title: "Total Products",
    value: 324,
    icon: Package,
    description: "All listed products",
    trend: { value: 12, isPositive: true },
  },
  {
    title: "Active Products",
    value: 287,
    icon: CheckCircle2,
    description: "Live on marketplace",
    trend: { value: 8, isPositive: true },
  },
  {
    title: "Out of Stock",
    value: 21,
    icon: AlertCircle,
    description: "Needs restocking",
    trend: { value: 5, isPositive: false },
  },
  {
    title: "Pending Approval",
    value: 16,
    icon: Clock,
    description: "Awaiting admin review",
    trend: { value: 3, isPositive: true },
  },
  {
    title: "Revenue",
    value: "$12,450",
    icon: DollarSign,
    description: "Total earnings this month",
    trend: { value: 18, isPositive: true },
  },
  {
    title: "Recent Activity",
    value: 42,
    icon: Activity,
    description: "Actions in last 7 days",
    trend: { value: 24, isPositive: true },
  },
]

export const recentProducts: RecentProduct[] = [
  {
    id: "1",
    title: "iPhone 14 Pro OLED Display",
    image: null,
    brand: "Apple",
    model: "iPhone 14 Pro",
    category: "Displays",
    stock: 12,
    status: "ACTIVE",
  },
  {
    id: "2",
    title: "Samsung S23 Ultra Battery",
    image: null,
    brand: "Samsung",
    model: "Galaxy S23 Ultra",
    category: "Batteries",
    stock: 0,
    status: "OUT_OF_STOCK",
  },
  {
    id: "3",
    title: "OnePlus 11 Charging Port",
    image: null,
    brand: "OnePlus",
    model: "OnePlus 11",
    category: "Ports",
    stock: 45,
    status: "ACTIVE",
  },
  {
    id: "4",
    title: "Xiaomi 13 Rear Camera",
    image: null,
    brand: "Xiaomi",
    model: "Xiaomi 13",
    category: "Cameras",
    stock: 8,
    status: "PENDING",
  },
  {
    id: "5",
    title: "Vivo V27 Battery",
    image: null,
    brand: "Vivo",
    model: "Vivo V27",
    category: "Batteries",
    stock: 0,
    status: "INACTIVE",
  },
  {
    id: "6",
    title: "Realme GT Neo 3 Display",
    image: null,
    brand: "Realme",
    model: "GT Neo 3",
    category: "Displays",
    stock: 23,
    status: "ACTIVE",
  },
  {
    id: "7",
    title: "Oppo Find X6 Pro Battery",
    image: null,
    brand: "Oppo",
    model: "Find X6 Pro",
    category: "Batteries",
    stock: 7,
    status: "PENDING",
  },
]

export const monthlyUploads: MonthlyUpload[] = [
  { month: "Jan", uploads: 24 },
  { month: "Feb", uploads: 32 },
  { month: "Mar", uploads: 45 },
  { month: "Apr", uploads: 38 },
  { month: "May", uploads: 52 },
  { month: "Jun", uploads: 48 },
  { month: "Jul", uploads: 61 },
  { month: "Aug", uploads: 55 },
  { month: "Sep", uploads: 67 },
  { month: "Oct", uploads: 72 },
  { month: "Nov", uploads: 58 },
  { month: "Dec", uploads: 84 },
]

export const productStatusData: ProductStatusDatum[] = [
  { name: "Active", value: 287 },
  { name: "Inactive", value: 36 },
  { name: "Out of Stock", value: 21 },
]

export const inventoryData: InventoryDatum[] = [
  { category: "Displays", stock: 156 },
  { category: "Batteries", stock: 312 },
  { category: "Ports", stock: 89 },
  { category: "Cameras", stock: 64 },
  { category: "Boards", stock: 48 },
  { category: "Others", stock: 112 },
]

export const quickActions: QuickActionItem[] = [
  {
    title: "Add Product",
    description: "List a new spare part",
    href: "/dealer/add-product",
    icon: Plus,
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Manage Inventory",
    description: "Update stock levels",
    href: "/dealer/inventory",
    icon: Warehouse,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Edit Profile",
    description: "Update business details",
    href: "/dealer/profile",
    icon: User,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "View Orders",
    description: "Check order status",
    href: "/dealer/orders",
    icon: ShoppingCart,
    color: "bg-amber-500/10 text-amber-600",
  },
]

export const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  tertiary: "#f59e0b",
  quaternary: "#f43f5e",
  quinary: "#8b5cf6",
  senary: "#06b6d4",
}
