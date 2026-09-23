"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  outOfStockProducts: number
  pendingApprovalProducts: number
  totalOrders: number
  pendingOrders: number
  totalEnquiries: number
  pendingEnquiries: number
  totalRevenue: number
}

export interface RecentProduct {
  id: string
  title: string
  image: string | null
  brand: string
  model: string
  category: string
  stock: number
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "INACTIVE" | "SUSPENDED"
  created_at: string
}

export interface ProductStatusData {
  name: string
  value: number
}

export interface MonthlyUpload {
  month: string
  uploads: number
}

export interface InventoryDatum {
  category: string
  stock: number
}

/**
 * Get dealer dashboard statistics using real Supabase data
 * All queries are scoped to the authenticated dealer via RLS policies
 */
export async function getDealerDashboardStats(): Promise<DashboardStats> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return {
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        pendingApprovalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalEnquiries: 0,
        pendingEnquiries: 0,
        totalRevenue: 0,
      }
    }

    const dealerId = userProfile.profile.id
    const supabase = await createServerClient()

    // Get product statistics
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, status, stock")
      .eq("dealer_id", dealerId)

    const totalProducts = products?.length || 0
    const activeProducts = products?.filter((p: any) => p.status === "APPROVED").length || 0
    const outOfStockProducts = products?.filter((p: any) => p.stock === 0).length || 0
    const pendingApprovalProducts = products?.filter((p: any) => p.status === "PENDING_APPROVAL").length || 0

    // Get order statistics
    const { count: totalOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, status, total", { count: "exact", head: true })
      .eq("seller_id", dealerId)

    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", dealerId)
      .eq("status", "PENDING")

    // Get revenue from completed orders with paid status
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("total")
      .eq("seller_id", dealerId)
      .in("status", ["COMPLETED", "DELIVERED"])

    // Check payment status for completed orders (if payments table exists)
    let totalRevenue = 0
    if (paidOrders && paidOrders.length > 0) {
      try {
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .in("order_id", paidOrders.map((o: any) => o.id))
          .eq("status", "COMPLETED")

        totalRevenue = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
      } catch (e) {
        // If payments table doesn't exist or has RLS issues, use order totals
        totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      }
    }

    // Get enquiry statistics
    const { count: totalEnquiries } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", dealerId)

    const { count: pendingEnquiries } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", dealerId)
      .eq("status", "PENDING")

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      pendingApprovalProducts,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalEnquiries: totalEnquiries || 0,
      pendingEnquiries: pendingEnquiries || 0,
      totalRevenue,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalProducts: 0,
      activeProducts: 0,
      outOfStockProducts: 0,
      pendingApprovalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalEnquiries: 0,
      pendingEnquiries: 0,
      totalRevenue: 0,
    }
  }
}

/**
 * Get recent products for the authenticated dealer
 */
export async function getDealerRecentProducts(limit = 7): Promise<RecentProduct[]> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return []
    }

    const dealerId = userProfile.profile.id
    const supabase = await createServerClient()

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        brand:brands(name),
        model:models(name),
        category:categories(name),
        stock,
        status,
        created_at,
        images:product_images(image_url)
      `)
      .eq("dealer_id", dealerId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !products) {
      return []
    }

    return products.map((product: any) => ({
      id: product.id,
      title: product.title,
      image: product.images?.[0]?.image_url || null,
      brand: product.brand?.name || "Unknown",
      model: product.model?.name || "Unknown",
      category: product.category?.name || "Unknown",
      stock: product.stock || 0,
      status: product.status,
      created_at: product.created_at,
    }))
  } catch (error) {
    console.error("Error fetching recent products:", error)
    return []
  }
}

/**
 * Get product status distribution for the authenticated dealer
 */
export async function getDealerProductStatusData(): Promise<ProductStatusData[]> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return []
    }

    const dealerId = userProfile.profile.id
    const supabase = await createServerClient()

    const { data: products, error } = await supabase
      .from("products")
      .select("status")
      .eq("dealer_id", dealerId)

    if (error || !products) {
      return []
    }

    const statusCounts = products.reduce((acc: any, product: any) => {
      const status = product.status || "UNKNOWN"
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value: value as number,
    }))
  } catch (error) {
    console.error("Error fetching product status data:", error)
    return []
  }
}

/**
 * Get monthly product uploads for the authenticated dealer for the current year
 */
export async function getDealerMonthlyUploads(): Promise<MonthlyUpload[]> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return []
    }

    const dealerId = userProfile.profile.id
    const supabase = await createServerClient()

    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1).toISOString()
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59).toISOString()

    const { data: products, error } = await supabase
      .from("products")
      .select("created_at")
      .eq("dealer_id", dealerId)
      .gte("created_at", startDate)
      .lte("created_at", endDate)

    if (error || !products) {
      // Return all months with zero if no data
      return getAllMonths().map(month => ({ month, uploads: 0 }))
    }

    // Group by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyCounts = new Array(12).fill(0)

    products.forEach((product: any) => {
      const date = new Date(product.created_at)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        monthlyCounts[monthIndex]++
      }
    })

    return monthNames.map((month, index) => ({
      month,
      uploads: monthlyCounts[index],
    }))
  } catch (error) {
    console.error("Error fetching monthly uploads:", error)
    return getAllMonths().map(month => ({ month, uploads: 0 }))
  }
}

/**
 * Get inventory by category for the authenticated dealer
 */
export async function getDealerInventoryByCategory(): Promise<InventoryDatum[]> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile?.profile?.id) {
      return []
    }

    const dealerId = userProfile.profile.id
    const supabase = await createServerClient()

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        stock,
        category:categories(name, display_order)
      `)
      .eq("dealer_id", dealerId)

    if (error || !products) {
      return []
    }

    // Aggregate stock by category
    const categoryStock = products.reduce((acc: any, product: any) => {
      const categoryName = product.category?.name || "Unknown"
      acc[categoryName] = (acc[categoryName] || 0) + (product.stock || 0)
      return acc
    }, {})

    // Convert to array and sort by display_order if available, then by name
    const categoryOrderMap = new Map()
    products.forEach((product: any) => {
      if (product.category?.name && product.category.display_order !== undefined) {
        categoryOrderMap.set(product.category.name, product.category.display_order)
      }
    })

    return Object.entries(categoryStock)
      .map(([category, stock]) => ({
        category,
        stock: stock as number,
      }))
      .sort((a, b) => {
        const orderA = categoryOrderMap.get(a.category) ?? 999
        const orderB = categoryOrderMap.get(b.category) ?? 999
        if (orderA !== orderB) {
          return orderA - orderB
        }
        return a.category.localeCompare(b.category)
      })
  } catch (error) {
    console.error("Error fetching inventory by category:", error)
    return []
  }
}

function getAllMonths(): string[] {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}