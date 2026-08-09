"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUserProfile, requireAdmin } from "@/lib/auth/auth.helpers"
import type { AnalyticsFilters, DashboardStats, TrendPoint, DealerPerformancePoint, TopProductPoint } from "@/types/analytics"

const db = supabaseAdmin as any

async function currentUser() {
  const profile = await getCurrentUserProfile()
  if (!profile?.user?.id) throw new Error("Unauthorized")
  return (profile.profile || profile.user) as any
}

function isInRange(iso: string, from?: string, to?: string) {
  const d = new Date(iso)
  if (from && d < new Date(from)) return false
  if (to && d > new Date(to)) return false
  return true
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1).toISOString()
}

function groupByDate(rows: any[], dateKey = "created_at"): TrendPoint[] {
  const map: Record<string, number> = {}
  for (const row of rows) {
    const date = new Date(row[dateKey]).toLocaleDateString("en-IN")
    map[date] = (map[date] || 0) + 1
  }
  return Object.entries(map)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime())
}

function sumByDate(rows: any[], dateKey = "created_at", valueKey = "value"): TrendPoint[] {
  const map: Record<string, number> = {}
  for (const row of rows) {
    const date = new Date(row[dateKey]).toLocaleDateString("en-IN")
    map[date] = (map[date] || 0) + Number(row[valueKey] || 0)
  }
  return Object.entries(map)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime())
}

export async function getDashboardData(filters: AnalyticsFilters = {}) {
  const user = await currentUser()
  const isAdmin = user.role === "ADMIN"
  const dealerId = isAdmin ? filters.dealerId : user.id

  const [ordersRes, paymentsRes, productsRes, inventoryRes, profilesRes, categoriesRes, brandsRes] = await Promise.all([
    db.from("orders").select("*"),
    db.from("payments").select("*"),
    db.from("products").select("id, title, price, category_id, brand_id").eq("is_active", true),
    db.from("inventory").select("*"),
    db.from("profiles").select("id, role, is_active, created_at, city"),
    db.from("categories").select("id, name"),
    db.from("brands").select("id, name"),
  ])

  if (ordersRes.error) throw ordersRes.error
  if (paymentsRes.error) throw paymentsRes.error
  if (productsRes.error) throw productsRes.error
  if (inventoryRes.error) throw inventoryRes.error
  if (profilesRes.error) throw profilesRes.error

  const allOrders: any[] = ordersRes.data || []
  const allPayments: any[] = paymentsRes.data || []
  const allProducts: any[] = productsRes.data || []
  const allInventory: any[] = inventoryRes.data || []
  const allProfiles: any[] = profilesRes.error ? [] : profilesRes.data || []
  const categories: any[] = categoriesRes.data || []
  const brands: any[] = brandsRes.data || []

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]))
  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]))

  const dealerOrders = dealerId ? allOrders.filter((o) => o.seller_id === dealerId || o.buyer_id === dealerId) : allOrders
  const dealerPayments = dealerId ? allPayments.filter((p) => p.dealer_id === dealerId) : allPayments
  const dealerInventory = dealerId ? allInventory.filter((i) => i.dealer_id === dealerId) : allInventory

  const filteredOrders = allOrders.filter((o) => isInRange(o.created_at, filters.from, filters.to))
  const filteredPayments = allPayments.filter((p) => isInRange(p.created_at, filters.from, filters.to))
  const filteredDealerOrders = dealerOrders.filter((o) => isInRange(o.created_at, filters.from, filters.to))
  const filteredDealerPayments = dealerPayments.filter((p) => isInRange(p.created_at, filters.from, filters.to))

  const completedOrders = filteredOrders.filter((o) => o.status === "COMPLETED" || o.payment_status === "PAID")
  const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING")
  const cancelledOrders = filteredOrders.filter((o) => o.status === "CANCELLED" || o.status === "REFUNDED")

  const capturedPayments = filteredPayments.filter((p) => p.status === "CAPTURED" || p.status === "PAID")
  const totalRevenue = capturedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const today = new Date()
  const todayRevenue = capturedPayments
    .filter((p) => p.created_at >= startOfDay(today))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const monthlyRevenue = capturedPayments
    .filter((p) => p.created_at >= startOfMonth(today))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const annualRevenue = capturedPayments
    .filter((p) => p.created_at >= startOfYear(today))
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const inventoryValue = dealerInventory.reduce((sum, i) => {
    const product = productMap[i.product_id]
    return sum + (i.available_stock || 0) * Number(product?.price || 0)
  }, 0)

  const lowStockProducts = dealerInventory.filter((i) => {
    const limit = i.low_stock_limit || 5
    return (i.available_stock || 0) <= limit
  }).length

  const totalCustomers = new Set(dealerOrders.map((o) => o.buyer_id)).size
  const activeDealers = allProfiles.filter((p) => p.role === "DEALER" && p.is_active).length

  const successfulPayments = filteredPayments.filter((p) => p.status === "CAPTURED" || p.status === "PAID").length
  const failedPayments = filteredPayments.filter((p) => p.status === "FAILED").length
  const paymentSuccessRate = successfulPayments + failedPayments > 0 ? (successfulPayments / (successfulPayments + failedPayments)) * 100 : 100

  const aov = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

  const stats: DashboardStats = {
    totalRevenue,
    todayRevenue,
    monthlyRevenue,
    annualRevenue,
    totalOrders: filteredOrders.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    cancelledOrders: cancelledOrders.length,
    totalCustomers,
    activeDealers,
    totalProducts: allProducts.length,
    inventoryValue,
    lowStockProducts,
    paymentSuccessRate,
    averageOrderValue: aov,
    averageDealerResponseTime: 0,
    averageDeliveryTime: 0,
  }

  const revenueTrend = sumByDate(
    capturedPayments.map((p) => ({ created_at: p.created_at, value: Number(p.amount || 0) })),
    "created_at",
    "value"
  )

  const ordersTrend = groupByDate(filteredOrders)

  const paymentsTrend: TrendPoint[] = Object.entries(
    filteredPayments.reduce((acc: any, p: any) => {
      const date = new Date(p.created_at).toLocaleDateString("en-IN")
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  )
    .map(([label, value]) => ({ label, value: Number(value) }))
    .sort((a: any, b: any) => new Date(a.label).getTime() - new Date(b.label).getTime())

  const dealerPerformance: DealerPerformancePoint[] = isAdmin
    ? (Object.values(
        filteredPayments.reduce((acc: any, p: any) => {
          const id = p.dealer_id
          if (!id) return acc
          if (!acc[id]) {
            const profile = allProfiles.find((pr: any) => pr.id === id)
            acc[id] = { name: profile?.name || "Unknown", revenue: 0, orders: 0 }
          }
          acc[id].revenue += Number(p.amount || 0)
          acc[id].orders += 1
          return acc
        }, {})
      ) as DealerPerformancePoint[]).slice(0, 10)
    : [{ name: user.name || user.email || "You", revenue: totalRevenue, orders: completedOrders.length }]

  const productValues = allProducts.map((p) => {
    const inv = dealerInventory.find((i) => i.product_id === p.id)
    const value = (inv?.available_stock || 0) * Number(p.price || 0)
    return { name: p.title, value }
  })
  const topProducts = productValues.sort((a, b) => b.value - a.value).slice(0, 10)

  const categoryValues: Record<string, number> = {}
  for (const p of allProducts) {
    const inv = dealerInventory.find((i: any) => i.product_id === p.id)
    const value = (inv?.available_stock || 0) * Number(p.price || 0)
    const key = categoryMap[p.category_id] || "Uncategorized"
    categoryValues[key] = (categoryValues[key] || 0) + value
  }
  const topCategories = Object.entries(categoryValues)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const brandValues: Record<string, number> = {}
  for (const p of allProducts) {
    const inv = dealerInventory.find((i: any) => i.product_id === p.id)
    const value = (inv?.available_stock || 0) * Number(p.price || 0)
    const key = brandMap[p.brand_id] || "Unbranded"
    brandValues[key] = (brandValues[key] || 0) + value
  }
  const topBrands = Object.entries(brandValues)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const customerAcquisition = groupByDate(allProfiles.filter((p: any) => p.role !== "ADMIN"))

  const inventoryByCategory: TrendPoint[] = Object.entries(categoryValues)
    .map(([name, value]) => ({ label: name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10)

  return {
    stats,
    revenueTrend,
    ordersTrend,
    paymentsTrend,
    dealerPerformance,
    topProducts,
    topCategories,
    topBrands,
    customerAcquisition,
    inventoryByCategory,
  }
}

export async function getReportData(type: string, filters: AnalyticsFilters = {}) {
  const user = await currentUser()
  const isAdmin = user.role === "ADMIN"
  const dealerId = isAdmin ? filters.dealerId : user.id

  switch (type) {
    case "revenue": {
      const { data, error } = await db.from("payments").select("*")
      if (error) throw error
      const rows = (data || [])
        .filter((p: any) => (dealerId ? p.dealer_id === dealerId : true))
        .filter((p: any) => isInRange(p.created_at, filters.from, filters.to))
      return { columns: ["ID", "Order ID", "Amount", "Status", "Date"], rows }
    }
    case "orders": {
      const { data, error } = await db.from("orders").select("*")
      if (error) throw error
      const rows = (data || [])
        .filter((o: any) => (dealerId ? o.seller_id === dealerId || o.buyer_id === dealerId : true))
        .filter((o: any) => isInRange(o.created_at, filters.from, filters.to))
      return { columns: ["ID", "Order Number", "Buyer", "Seller", "Total", "Status", "Date"], rows }
    }
    case "payments":
      return getReportData("revenue", filters)
    case "inventory": {
      const { data, error } = await db.from("inventory").select("*, product:products(title)")
      if (error) throw error
      const rows = (data || []).filter((i: any) => (dealerId ? i.dealer_id === dealerId : true))
      return { columns: ["Product", "Available", "Reserved", "Low Limit", "Critical"], rows }
    }
    case "dealers": {
      await requireAdmin()
      const { data, error } = await db.from("profiles").select("*").eq("role", "DEALER")
      if (error) throw error
      return { columns: ["ID", "Name", "Email", "Active", "Created"], rows: data || [] }
    }
    case "customers": {
      const { data, error } = await db.from("profiles").select("*").neq("role", "ADMIN")
      if (error) throw error
      const rows = (data || []).filter((p: any) => (dealerId ? p.id === dealerId : true))
      return { columns: ["ID", "Name", "Email", "Role", "Active", "Created"], rows }
    }
    case "products": {
      const { data, error } = await db.from("products").select("*").eq("is_active", true)
      if (error) throw error
      return { columns: ["ID", "Title", "Price", "Category", "Brand", "Created"], rows: data || [] }
    }
    case "refunds": {
      const { data, error } = await db.from("payments").select("*").in("status", ["REFUNDED", "PARTIALLY_REFUNDED"])
      if (error) throw error
      const rows = (data || [])
        .filter((p: any) => (dealerId ? p.dealer_id === dealerId : true))
        .filter((p: any) => isInRange(p.created_at, filters.from, filters.to))
      return { columns: ["ID", "Order ID", "Amount", "Status", "Date"], rows }
    }
    default:
      throw new Error("Unknown report type")
  }
}
