"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

export interface AdminDashboardStats {
  totalDealers: number
  activeDealers: number
  pendingDealers: number
  totalProducts: number
  pendingProducts: number
  revenue: number
  monthlyOrders: number
  percentageChanges: {
    totalDealers: number
    activeDealers: number
    pendingDealers: number
    totalProducts: number
    pendingProducts: number
    revenue: number
    monthlyOrders: number
  }
}

export interface RecentActivity {
  id: string
  title: string
  description: string
  time: string
  icon: string
  color: string
}

export interface PendingApprovals {
  pendingDealers: number
  pendingProducts: number
}

export interface LowStockProduct {
  id: string
  title: string
  stock: number
  lowStockLimit: number
}

export interface MonthlyRegistration {
  month: string
  registrations: number
}

export interface ProductApprovalData {
  name: string
  value: number
}

export interface OrdersOverviewData {
  month: string
  orders: number
  revenue: number
}

/**
 * Get all admin dashboard statistics with real Supabase data
 * Uses service role key to bypass RLS for admin access
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all data in parallel for better performance
    const [
      totalDealersResult,
      activeDealersResult,
      currentMonthDealersResult,
      previousMonthDealersResult,
      totalProductsResult,
      currentMonthOrdersResult,
      previousMonthOrdersResult,
      currentMonthRevenueResult,
      previousMonthRevenueResult,
    ] = await Promise.all([
      // Total dealers
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "DEALER"),

      // Active dealers (is_active = true)
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "DEALER")
        .eq("is_active", true),

      // Dealers registered this month
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "DEALER")
        .gte("created_at", currentMonthStart.toISOString()),

      // Dealers registered previous month
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "DEALER")
        .gte("created_at", previousMonthStart.toISOString())
        .lt("created_at", previousMonthEnd.toISOString()),

      // Total products
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true }),

      // Orders this month
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", currentMonthStart.toISOString()),

      // Orders previous month
      supabaseAdmin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", previousMonthStart.toISOString())
        .lt("created_at", previousMonthEnd.toISOString()),

      // Revenue this month (from paid/captured payments)
      supabaseAdmin
        .from("payments")
        .select("amount")
        .in("status", ["PAID", "CAPTURED"])
        .gte("created_at", currentMonthStart.toISOString()),

      // Revenue previous month
      supabaseAdmin
        .from("payments")
        .select("amount")
        .in("status", ["PAID", "CAPTURED"])
        .gte("created_at", previousMonthStart.toISOString())
        .lt("created_at", previousMonthEnd.toISOString()),
    ])

    const totalDealers = totalDealersResult.count || 0
    const activeDealers = activeDealersResult.count || 0
    const pendingDealers = totalDealers - activeDealers // Inactive dealers = pending approval
    const totalProducts = totalProductsResult.count || 0
    const pendingProducts = 0 // No PENDING status in product_status enum
    const monthlyOrders = currentMonthOrdersResult.count || 0

    // Calculate revenue
    const currentMonthRevenue = currentMonthRevenueResult.data?.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    ) || 0
    const previousMonthRevenue = previousMonthRevenueResult.data?.reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    ) || 0

    // Calculate percentage changes
    const currentMonthDealers = currentMonthDealersResult.count || 0
    const previousMonthDealers = previousMonthDealersResult.count || 0
    const previousMonthOrders = previousMonthOrdersResult.count || 0

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const percentageChanges = {
      totalDealers: calculatePercentageChange(totalDealers, previousMonthDealers),
      activeDealers: calculatePercentageChange(activeDealers, previousMonthDealers),
      pendingDealers: calculatePercentageChange(pendingDealers, previousMonthDealers),
      totalProducts: 0, // Need historical data for accurate calculation
      pendingProducts: 0,
      revenue: calculatePercentageChange(currentMonthRevenue, previousMonthRevenue),
      monthlyOrders: calculatePercentageChange(monthlyOrders, previousMonthOrders),
    }

    return {
      totalDealers,
      activeDealers,
      pendingDealers,
      totalProducts,
      pendingProducts,
      revenue: currentMonthRevenue,
      monthlyOrders,
      percentageChanges,
    }
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error)
    return {
      totalDealers: 0,
      activeDealers: 0,
      pendingDealers: 0,
      totalProducts: 0,
      pendingProducts: 0,
      revenue: 0,
      monthlyOrders: 0,
      percentageChanges: {
        totalDealers: 0,
        activeDealers: 0,
        pendingDealers: 0,
        totalProducts: 0,
        pendingProducts: 0,
        revenue: 0,
        monthlyOrders: 0,
      },
    }
  }
}

/**
 * Get recent activities from activity_logs or system_audit_logs
 */
export async function getRecentActivities(limit = 10): Promise<RecentActivity[]> {
  try {
    // Try to get from activity_logs first
    const { data: activities, error } = await supabaseAdmin
      .from("activity_logs")
      .select(`
        id,
        action,
        entity_type,
        metadata,
        created_at,
        user:profiles(name, business_name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !activities || activities.length === 0) {
      // Fallback to system_audit_logs
      const { data: auditLogs, error: auditError } = await supabaseAdmin
        .from("system_audit_logs")
        .select(`
          id,
          action,
          entity_type,
          metadata,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (auditError || !auditLogs) {
        return []
      }

      return formatAuditLogsAsActivities(auditLogs)
    }

    return formatActivityLogs(activities)
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }
}

function formatActivityLogs(activities: any[]): RecentActivity[] {
  return activities.map((log) => {
    const timeAgo = getTimeAgo(log.created_at)
    const { title, description, icon, color } = formatActivityMessage(log)

    return {
      id: log.id,
      title,
      description,
      time: timeAgo,
      icon,
      color,
    }
  })
}

function formatAuditLogsAsActivities(auditLogs: any[]): RecentActivity[] {
  return auditLogs.map((log) => {
    const timeAgo = getTimeAgo(log.created_at)
    const { title, description, icon, color } = formatActivityMessage(log)

    return {
      id: log.id,
      title,
      description,
      time: timeAgo,
      icon,
      color,
    }
  })
}

function formatActivityMessage(log: any): { title: string; description: string; icon: string; color: string } {
  const action = log.action?.toLowerCase() || ""
  const entityType = log.entity_type?.toLowerCase() || ""
  const metadata = log.metadata || {}
  const userName = log.user?.business_name || log.user?.name || "System"

  // Handle notification activities
  if (entityType === "notification" || action.includes("notification")) {
    if (action.includes("created")) {
      return {
        title: "New notification",
        description: `${userName} received a new platform notification`,
        icon: "Activity",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("updated")) {
      return {
        title: "Notification updated",
        description: `${userName} updated a notification`,
        icon: "Settings",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
  }

  // Handle dealer activities
  if (entityType === "dealer" || entityType === "profile") {
    if (action.includes("created") || action.includes("insert")) {
      return {
        title: "New dealer registered",
        description: `Dealer "${userName}" joined the platform`,
        icon: "Building2",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("approved") || action.includes("activate")) {
      return {
        title: "Dealer approved",
        description: `Dealer "${userName}" account was approved`,
        icon: "CheckCircle2",
        color: "bg-emerald-500/10 text-emerald-600",
      }
    }
    if (action.includes("suspended")) {
      return {
        title: "Dealer suspended",
        description: `Dealer "${userName}" account was suspended`,
        icon: "XCircle",
        color: "bg-rose-500/10 text-rose-600",
      }
    }
    if (action.includes("updated")) {
      return {
        title: "Dealer updated",
        description: `Dealer "${userName}" profile was updated`,
        icon: "Settings",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
  }

  // Handle enquiry activities
  if (entityType === "enquiry") {
    if (action.includes("created") || action.includes("insert")) {
      return {
        title: "New enquiry created",
        description: `Dealer "${userName}" created a new enquiry`,
        icon: "Package",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("accepted")) {
      return {
        title: "Enquiry accepted",
        description: `Dealer "${userName}" accepted an enquiry`,
        icon: "CheckCircle2",
        color: "bg-emerald-500/10 text-emerald-600",
      }
    }
    if (action.includes("rejected")) {
      return {
        title: "Enquiry rejected",
        description: `Dealer "${userName}" rejected an enquiry`,
        icon: "XCircle",
        color: "bg-rose-500/10 text-rose-600",
      }
    }
    if (action.includes("updated")) {
      return {
        title: "Enquiry updated",
        description: `Enquiry details were updated by ${userName}`,
        icon: "Settings",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
  }

  // Handle order activities
  if (entityType === "order") {
    const orderNumber = metadata.order_number || metadata.orderId || "an order"
    if (action.includes("created") || action.includes("insert")) {
      return {
        title: "Order created",
        description: `Order ${orderNumber} was created`,
        icon: "ShoppingCart",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("updated")) {
      const status = metadata.status || metadata.new_status || ""
      if (status) {
        return {
          title: "Order status updated",
          description: `Dealer ${userName} updated order ${orderNumber} to ${status.toUpperCase()}`,
          icon: "Settings",
          color: "bg-amber-500/10 text-amber-600",
        }
      }
      return {
        title: "Order updated",
        description: `Order ${orderNumber} was updated by ${userName}`,
        icon: "Settings",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
    if (action.includes("cancelled")) {
      return {
        title: "Order cancelled",
        description: `Order ${orderNumber} was cancelled`,
        icon: "XCircle",
        color: "bg-rose-500/10 text-rose-600",
      }
    }
  }

  // Handle product activities
  if (entityType === "product") {
    const productName = metadata.title || metadata.product_name || metadata.name || "a product"
    if (action.includes("created") || action.includes("insert")) {
      return {
        title: "Product added",
        description: `A new product was added by ${userName}`,
        icon: "Package",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("updated")) {
      return {
        title: "Product updated",
        description: `Product details were updated by ${userName}`,
        icon: "Settings",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
    if (action.includes("deleted")) {
      return {
        title: "Product removed",
        description: `A product was removed by ${userName}`,
        icon: "XCircle",
        color: "bg-rose-500/10 text-rose-600",
      }
    }
  }

  // Handle payment activities
  if (entityType === "payment") {
    if (action.includes("created") || action.includes("insert")) {
      return {
        title: "Payment initiated",
        description: `A payment was initiated`,
        icon: "DollarSign",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("completed") || action.includes("paid") || action.includes("captured")) {
      return {
        title: "Payment received",
        description: `Payment was successfully received`,
        icon: "CheckCircle2",
        color: "bg-emerald-500/10 text-emerald-600",
      }
    }
    if (action.includes("failed")) {
      return {
        title: "Payment failed",
        description: `A payment transaction failed`,
        icon: "XCircle",
        color: "bg-rose-500/10 text-rose-600",
      }
    }
    if (action.includes("refunded")) {
      return {
        title: "Payment refunded",
        description: `A payment was refunded`,
        icon: "Activity",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
  }

  // Handle quotation activities
  if (action.includes("quotation")) {
    if (action.includes("sent")) {
      return {
        title: "Quotation sent",
        description: `A quotation was sent for an enquiry`,
        icon: "Package",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
  }

  // Handle category/brand activities
  if (entityType === "category" || entityType === "brand") {
    if (action.includes("created") || action.includes("insert")) {
      return {
        title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} added`,
        description: `A new ${entityType} was added by ${userName}`,
        icon: "Layers",
        color: "bg-blue-500/10 text-blue-600",
      }
    }
    if (action.includes("updated")) {
      return {
        title: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} updated`,
        description: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} details were updated`,
        icon: "Settings",
        color: "bg-amber-500/10 text-amber-600",
      }
    }
  }

  // Default fallback for unknown actions
  const readableAction = action.replace(/_/g, " ")
  const readableEntity = entityType.replace(/_/g, " ")
  return {
    title: `${readableAction.charAt(0).toUpperCase() + readableAction.slice(1)}`,
    description: `${readableEntity.charAt(0).toUpperCase() + readableEntity.slice(1)} by ${userName}`,
    icon: "Activity",
    color: "bg-slate-500/10 text-slate-600",
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`
    }
  }

  return "Just now"
}

/**
 * Get pending approvals count
 */
export async function getPendingApprovals(): Promise<PendingApprovals> {
  try {
    const [pendingDealersResult, totalProductsResult] = await Promise.all([
      // Inactive dealers = pending approval
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "DEALER")
        .eq("is_active", false),

      // Total products (no PENDING status in enum)
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true }),
    ])

    return {
      pendingDealers: pendingDealersResult.count || 0,
      pendingProducts: 0, // No PENDING status in product_status enum
    }
  } catch (error) {
    console.error("Error fetching pending approvals:", error)
    return { pendingDealers: 0, pendingProducts: 0 }
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(limit = 10): Promise<LowStockProduct[]> {
  try {
    const { data: inventory, error } = await supabaseAdmin
      .from("inventory")
      .select(`
        id,
        available_stock,
        low_stock_limit,
        product:products(id, title)
      `)
      .order("available_stock", { ascending: true })
      .limit(limit * 2) // Fetch more to filter

    if (error || !inventory) {
      return []
    }

    return inventory
      .filter((item: any) => item.available_stock <= (item.low_stock_limit || 10))
      .slice(0, limit)
      .map((item: any) => ({
        id: item.product?.id || item.id,
        title: item.product?.title || "Unknown Product",
        stock: item.available_stock,
        lowStockLimit: item.low_stock_limit || 10,
      }))
  } catch (error) {
    console.error("Error fetching low stock products:", error)
    return []
  }
}

/**
 * Get monthly dealer registrations for the current year
 */
export async function getMonthlyDealerRegistrations(): Promise<MonthlyRegistration[]> {
  try {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const { data: dealers, error } = await supabaseAdmin
      .from("profiles")
      .select("created_at")
      .eq("role", "DEALER")
      .gte("created_at", yearStart.toISOString())

    if (error || !dealers) {
      return getEmptyMonthlyData()
    }

    // Group by month
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: new Date(0, index).toLocaleString("default", { month: "short" }),
      registrations: 0,
    }))

    dealers.forEach((dealer: any) => {
      const month = new Date(dealer.created_at).getMonth()
      monthlyData[month].registrations++
    })

    return monthlyData
  } catch (error) {
    console.error("Error fetching monthly dealer registrations:", error)
    return getEmptyMonthlyData()
  }
}

/**
 * Get product approval status distribution
 */
export async function getProductApprovalData(): Promise<ProductApprovalData[]> {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("status")

    if (error || !products) {
      return [
        { name: "Active", value: 0 },
        { name: "Inactive", value: 0 },
        { name: "Out of Stock", value: 0 },
      ]
    }

    const statusCounts = products.reduce((acc: any, product: any) => {
      const status = product.status || "UNKNOWN"
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return [
      { name: "Active", value: statusCounts.ACTIVE || 0 },
      { name: "Inactive", value: statusCounts.INACTIVE || 0 },
      { name: "Out of Stock", value: statusCounts.OUT_OF_STOCK || 0 },
    ]
  } catch (error) {
    console.error("Error fetching product approval data:", error)
    return [
      { name: "Active", value: 0 },
      { name: "Inactive", value: 0 },
      { name: "Out of Stock", value: 0 },
    ]
  }
}

/**
 * Get orders overview by month for the current year
 */
export async function getOrdersOverviewData(): Promise<OrdersOverviewData[]> {
  try {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("created_at, total")
      .gte("created_at", yearStart.toISOString())

    if (error || !orders) {
      return getEmptyOrdersData()
    }

    // Group by month
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      month: new Date(0, index).toLocaleString("default", { month: "short" }),
      orders: 0,
      revenue: 0,
    }))

    orders.forEach((order: any) => {
      const month = new Date(order.created_at).getMonth()
      monthlyData[month].orders++
      monthlyData[month].revenue += order.total || 0
    })

    return monthlyData
  } catch (error) {
    console.error("Error fetching orders overview data:", error)
    return getEmptyOrdersData()
  }
}

function getEmptyMonthlyData(): MonthlyRegistration[] {
  return new Array(12).fill(0).map((_, index) => ({
    month: new Date(0, index).toLocaleString("default", { month: "short" }),
    registrations: 0,
  }))
}

function getEmptyOrdersData(): OrdersOverviewData[] {
  return new Array(12).fill(0).map((_, index) => ({
    month: new Date(0, index).toLocaleString("default", { month: "short" }),
    orders: 0,
    revenue: 0,
  }))
}
