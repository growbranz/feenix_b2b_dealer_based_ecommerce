"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import type { ExecutiveDashboardData, AdvancedReportType, AuditReportType, ReportFilters, RankedItem } from "@/types/reports"
import { forecastRevenue } from "@/lib/forecast/actions"

const db = supabaseAdmin as any

function isInRange(iso: string, from?: string, to?: string) {
  const d = new Date(iso)
  if (from && d < new Date(from)) return false
  if (to && d > new Date(to)) return false
  return true
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

async function fetchAll() {
  const [ordersRes, paymentsRes, productsRes, inventoryRes, profilesRes, categoriesRes, brandsRes] = await Promise.all([
    db.from("orders").select("*"),
    db.from("payments").select("*"),
    db.from("products").select("*").eq("is_active", true),
    db.from("inventory").select("*"),
    db.from("profiles").select("*"),
    db.from("categories").select("id, name"),
    db.from("brands").select("id, name"),
  ])

  let orderItems: any[] = []
  try {
    const { data } = await db.from("order_items").select("*")
    orderItems = data || []
  } catch (e) {}

  let enquiries: any[] = []
  try {
    const { data } = await db.from("enquiries").select("*")
    enquiries = data || []
  } catch (e) {}

  return {
    orders: ordersRes.data || [],
    payments: paymentsRes.data || [],
    products: productsRes.data || [],
    inventory: inventoryRes.data || [],
    profiles: profilesRes.data || [],
    categories: categoriesRes.data || [],
    brands: brandsRes.data || [],
    orderItems,
    enquiries,
  }
}

export async function getExecutiveDashboardData(filters: ReportFilters = {}): Promise<ExecutiveDashboardData> {
  await requireAdmin()
  const { orders, payments, products, inventory, profiles, categories, brands, orderItems } = await fetchAll()

  const filteredOrders = orders.filter((o: any) => isInRange(o.created_at, filters.from, filters.to))
  const filteredPayments = payments.filter((p: any) => isInRange(p.created_at, filters.from, filters.to))
  const capturedPayments = filteredPayments.filter((p: any) => p.status === "CAPTURED" || p.status === "PAID")
  const totalRevenue = capturedPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

  const now = new Date()
  const currentMonth = startOfMonth(now)
  const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  const currentQuarter = Math.floor(currentMonth.getMonth() / 3)
  const currentYear = currentMonth.getFullYear()

  const revenueByMonth: Record<string, number> = {}
  for (const p of capturedPayments) {
    const d = new Date(p.created_at)
    const key = monthKey(d)
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(p.amount || 0)
  }

  const currentMonthRevenue = revenueByMonth[monthKey(currentMonth)] || 0
  const prevMonthRevenue = revenueByMonth[monthKey(prevMonth)] || 0
  const monthlyGrowth = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

  const currentQuarterKeys = Array.from({ length: 3 }, (_, i) => {
    const m = currentQuarter * 3 + i
    return `${currentYear}-${String(m + 1).padStart(2, "0")}`
  })
  const prevQuarterKeys = Array.from({ length: 3 }, (_, i) => {
    const m = currentQuarter * 3 + i - 3
    const year = m < 0 ? currentYear - 1 : currentYear
    const month = ((m % 12) + 12) % 12
    return `${year}-${String(month + 1).padStart(2, "0")}`
  })
  const currentQuarterRevenue = currentQuarterKeys.reduce((s, k) => s + (revenueByMonth[k] || 0), 0)
  const prevQuarterRevenue = prevQuarterKeys.reduce((s, k) => s + (revenueByMonth[k] || 0), 0)
  const quarterlyGrowth = prevQuarterRevenue > 0 ? ((currentQuarterRevenue - prevQuarterRevenue) / prevQuarterRevenue) * 100 : 0

  const yearlyKeys = Object.keys(revenueByMonth).filter((k) => k.startsWith(String(currentYear)))
  const prevYearlyKeys = Object.keys(revenueByMonth).filter((k) => k.startsWith(String(currentYear - 1)))
  const currentYearRevenue = yearlyKeys.reduce((s, k) => s + revenueByMonth[k], 0)
  const prevYearRevenue = prevYearlyKeys.reduce((s, k) => s + revenueByMonth[k], 0)
  const yearlyGrowth = prevYearRevenue > 0 ? ((currentYearRevenue - prevYearRevenue) / prevYearRevenue) * 100 : 0

  const completedOrders = filteredOrders.filter((o: any) => o.status === "COMPLETED" || o.payment_status === "PAID")
  const completionRate = filteredOrders.length > 0 ? (completedOrders.length / filteredOrders.length) * 100 : 0

  const successfulPayments = filteredPayments.filter((p: any) => p.status === "CAPTURED" || p.status === "PAID").length
  const failedPayments = filteredPayments.filter((p: any) => p.status === "FAILED").length
  const paymentSuccessRate = successfulPayments + failedPayments > 0 ? (successfulPayments / (successfulPayments + failedPayments)) * 100 : 100

  const lowStockProducts = inventory.filter((i: any) => {
    const limit = i.low_stock_limit || 5
    return (i.available_stock || 0) <= limit
  }).length

  const health = Math.min(
    100,
    Math.max(
      0,
      (monthlyGrowth > 0 ? 25 : 10) +
        completionRate * 0.35 +
        paymentSuccessRate * 0.25 +
        (lowStockProducts === 0 ? 15 : lowStockProducts < 5 ? 10 : 5)
    )
  )

  const forecast = await forecastRevenue(filters)

  const outstandingPayments = payments.filter(
    (p: any) => !["CAPTURED", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(p.status)
  )
  const pendingRefunds = payments.filter(
    (p: any) => p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED"
  )

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))
  const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]))
  const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]))
  const brandMap = Object.fromEntries(brands.map((b: any) => [b.id, b.name]))

  const dealerRevenue: Record<string, number> = {}
  for (const p of capturedPayments) {
    dealerRevenue[p.dealer_id] = (dealerRevenue[p.dealer_id] || 0) + Number(p.amount || 0)
  }
  const dealerPerformance = Object.entries(dealerRevenue)
    .map(([id, value]) => ({ id, name: profileMap[id]?.name || "Unknown", value }))
    .sort((a: any, b: any) => b.value - a.value)

  const customerSpend: Record<string, number> = {}
  for (const o of completedOrders) {
    customerSpend[o.buyer_id] = (customerSpend[o.buyer_id] || 0) + Number(o.total || 0)
  }
  const customerPerformance = Object.entries(customerSpend)
    .map(([id, value]) => ({ id, name: profileMap[id]?.name || "Unknown", value }))
    .sort((a: any, b: any) => b.value - a.value)

  const productSales: Record<string, number> = {}
  for (const item of orderItems) {
    productSales[item.product_id] = (productSales[item.product_id] || 0) + Number(item.quantity || 1) * Number(item.unit_price || item.price || 0)
  }
  const topProducts = Object.entries(productSales).length
    ? Object.entries(productSales)
        .map(([id, value]) => ({ id, name: productMap[id]?.title || "Unknown", value }))
        .sort((a: any, b: any) => b.value - a.value)
    : products
        .map((p: any) => {
          const inv = inventory.find((i: any) => i.product_id === p.id)
          return { id: p.id, name: p.title, value: Number(p.price || 0) * (inv?.available_stock || 0) }
        })
        .sort((a: any, b: any) => b.value - a.value)

  const categoryValues: Record<string, number> = {}
  for (const p of products) {
    const inv = inventory.find((i: any) => i.product_id === p.id)
    const value = Number(p.price || 0) * (inv?.available_stock || 0)
    const key = categoryMap[p.category_id] || "Uncategorized"
    categoryValues[key] = (categoryValues[key] || 0) + value
  }
  const topCategories = Object.entries(categoryValues)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)

  const brandValues: Record<string, number> = {}
  for (const p of products) {
    const inv = inventory.find((i: any) => i.product_id === p.id)
    const value = Number(p.price || 0) * (inv?.available_stock || 0)
    const key = brandMap[p.brand_id] || "Unbranded"
    brandValues[key] = (brandValues[key] || 0) + value
  }
  const topBrands = Object.entries(brandValues)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)

  const fastMoving = inventory
    .filter((i: any) => (i.available_stock || 0) <= (i.low_stock_limit || 5) && (i.available_stock || 0) > 0)
    .map((i: any) => ({ ...i, product: productMap[i.product_id] }))
  const deadStock = inventory
    .filter((i: any) => (i.available_stock || 0) > (i.recommended_reorder_level || 0) * 3)
    .map((i: any) => ({ ...i, product: productMap[i.product_id] }))
  const slowMoving = inventory
    .filter((i: any) => (i.available_stock || 0) > (i.low_stock_limit || 5) * 4)
    .map((i: any) => ({ ...i, product: productMap[i.product_id] }))

  return {
    kpis: {
      businessHealthScore: Math.round(health),
      monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
      quarterlyGrowth: Number(quarterlyGrowth.toFixed(2)),
      yearlyGrowth: Number(yearlyGrowth.toFixed(2)),
      revenueForecast: Math.round(forecast.nextPeriodValue),
      profitEstimate: Math.round(totalRevenue * 0.2),
      outstandingPayments: outstandingPayments.length,
      pendingRefunds: pendingRefunds.length,
    },
    topDealers: dealerPerformance.slice(0, 10),
    lowestDealers: dealerPerformance.slice(-5).reverse(),
    topCustomers: customerPerformance.slice(0, 10),
    topProducts: topProducts.slice(0, 10),
    topCategories: topCategories.slice(0, 10),
    topBrands: topBrands.slice(0, 10),
    inventoryStatus: { fastMoving, slowMoving, deadStock },
    outstandingPayments: outstandingPayments.slice(0, 20),
    pendingRefunds: pendingRefunds.slice(0, 20),
  }
}

function cityStateFromProfile(profileId: string, profiles: any[]) {
  const p = profiles.find((pr: any) => pr.id === profileId)
  return { city: p?.city || "Unknown", state: p?.state || "Unknown" }
}

export async function getAdvancedReport(type: AdvancedReportType, filters: ReportFilters = {}) {
  await requireAdmin()
  const { orders, payments, products, inventory, profiles, orderItems, enquiries, categories, brands } = await fetchAll()
  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]))
  const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]))
  const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]))
  const brandMap = Object.fromEntries(brands.map((b: any) => [b.id, b.name]))

  const filteredOrders = orders.filter((o: any) => isInRange(o.created_at, filters.from, filters.to))
  const filteredPayments = payments.filter((p: any) => isInRange(p.created_at, filters.from, filters.to))

  switch (type) {
    case "dealer-performance": {
      const map: Record<string, number> = {}
      for (const p of filteredPayments) {
        if (p.dealer_id) map[p.dealer_id] = (map[p.dealer_id] || 0) + Number(p.amount || 0)
      }
      const rows = Object.entries(map)
        .map(([id, revenue]) => ({ dealer: profileMap[id]?.name || id, revenue, orders: filteredOrders.filter((o: any) => o.seller_id === id).length }))
        .sort((a: any, b: any) => b.revenue - a.revenue)
      return { columns: [{ key: "dealer", label: "Dealer" }, { key: "revenue", label: "Revenue" }, { key: "orders", label: "Orders" }], rows }
    }
    case "customer-lifetime-value": {
      const map: Record<string, { name: string; revenue: number; orders: number }> = {}
      for (const o of filteredOrders) {
        if (!map[o.buyer_id]) map[o.buyer_id] = { name: profileMap[o.buyer_id]?.name || o.buyer_id, revenue: 0, orders: 0 }
        map[o.buyer_id].revenue += Number(o.total || 0)
        map[o.buyer_id].orders += 1
      }
      const rows = Object.values(map).sort((a: any, b: any) => b.revenue - a.revenue)
      return { columns: [{ key: "name", label: "Customer" }, { key: "revenue", label: "LTV" }, { key: "orders", label: "Orders" }], rows }
    }
    case "repeat-customers": {
      const map: Record<string, number> = {}
      for (const o of filteredOrders) {
        map[o.buyer_id] = (map[o.buyer_id] || 0) + 1
      }
      const rows = Object.entries(map)
        .filter(([_, count]) => count > 1)
        .map(([id, orders]) => ({ customer: profileMap[id]?.name || id, orders }))
        .sort((a: any, b: any) => b.orders - a.orders)
      return { columns: [{ key: "customer", label: "Customer" }, { key: "orders", label: "Orders" }], rows }
    }
    case "sales-funnel": {
      const enquiriesCount = enquiries.length
      const ordersCount = filteredOrders.length
      const completedCount = filteredOrders.filter((o: any) => o.status === "COMPLETED" || o.payment_status === "PAID").length
      return {
        columns: [{ key: "stage", label: "Stage" }, { key: "count", label: "Count" }],
        rows: [
          { stage: "Enquiries", count: enquiriesCount },
          { stage: "Orders", count: ordersCount },
          { stage: "Completed", count: completedCount },
        ],
      }
    }
    case "enquiry-conversion": {
      const enquiriesCount = enquiries.length
      const ordersCount = filteredOrders.length
      const rate = enquiriesCount > 0 ? ((ordersCount / enquiriesCount) * 100).toFixed(2) : "0"
      return {
        columns: [{ key: "metric", label: "Metric" }, { key: "value", label: "Value" }],
        rows: [
          { metric: "Enquiries", value: enquiriesCount },
          { metric: "Orders", value: ordersCount },
          { metric: "Conversion %", value: rate },
        ],
      }
    }
    case "order-completion": {
      const total = filteredOrders.length
      const completed = filteredOrders.filter((o: any) => o.status === "COMPLETED" || o.payment_status === "PAID").length
      const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : "0"
      return {
        columns: [{ key: "metric", label: "Metric" }, { key: "value", label: "Value" }],
        rows: [
          { metric: "Total", value: total },
          { metric: "Completed", value: completed },
          { metric: "Rate %", value: rate },
        ],
      }
    }
    case "refund-analysis": {
      const refunds = filteredPayments.filter((p: any) => p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED")
      const byMonth: Record<string, number> = {}
      for (const p of refunds) {
        const key = monthKey(new Date(p.created_at))
        byMonth[key] = (byMonth[key] || 0) + Number(p.amount || 0)
      }
      const rows = Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).sort((a: any, b: any) => a.month.localeCompare(b.month))
      return { columns: [{ key: "month", label: "Month" }, { key: "amount", label: "Refund Amount" }], rows }
    }
    case "payment-failure": {
      const failed = filteredPayments.filter((p: any) => p.status === "FAILED")
      const totalAmount = failed.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
      return {
        columns: [{ key: "metric", label: "Metric" }, { key: "value", label: "Value" }],
        rows: [
          { metric: "Failed Payments", value: failed.length },
          { metric: "Failed Amount", value: totalAmount },
        ],
      }
    }
    case "inventory-turnover": {
      const rows = inventory.map((i: any) => {
        const p = productMap[i.product_id]
        return {
          product: p?.title || i.product_id,
          available: i.available_stock,
          reserved: i.reserved_stock,
          turnover: i.reserved_stock > 0 ? Number((i.reserved_stock / Math.max(1, i.available_stock + i.reserved_stock)).toFixed(2)) : 0,
        }
      })
      return { columns: [{ key: "product", label: "Product" }, { key: "available", label: "Available" }, { key: "reserved", label: "Reserved" }, { key: "turnover", label: "Turnover" }], rows }
    }
    case "product-performance": {
      if (orderItems.length) {
        const map: Record<string, number> = {}
        for (const item of orderItems) {
          if (!isInRange(item.created_at, filters.from, filters.to)) continue
          map[item.product_id] = (map[item.product_id] || 0) + Number(item.quantity || 1)
        }
        const rows = Object.entries(map)
          .map(([id, qty]) => ({ product: productMap[id]?.title || id, quantity: qty, revenue: Number(productMap[id]?.price || 0) * qty }))
          .sort((a: any, b: any) => b.quantity - a.quantity)
        return { columns: [{ key: "product", label: "Product" }, { key: "quantity", label: "Quantity" }, { key: "revenue", label: "Revenue" }], rows }
      }
      const rows = products
        .map((p: any) => {
          const inv = inventory.find((i: any) => i.product_id === p.id)
          return { product: p.title, quantity: inv?.available_stock || 0, revenue: Number(p.price || 0) * (inv?.available_stock || 0) }
        })
        .sort((a: any, b: any) => b.revenue - a.revenue)
      return { columns: [{ key: "product", label: "Product" }, { key: "quantity", label: "Quantity" }, { key: "revenue", label: "Inventory Value" }], rows }
    }
    case "city-sales": {
      const map: Record<string, number> = {}
      for (const o of filteredOrders) {
        const { city } = cityStateFromProfile(o.buyer_id, profiles)
        map[city] = (map[city] || 0) + Number(o.total || 0)
      }
      const rows = Object.entries(map).map(([city, revenue]) => ({ city, revenue })).sort((a: any, b: any) => b.revenue - a.revenue)
      return { columns: [{ key: "city", label: "City" }, { key: "revenue", label: "Revenue" }], rows }
    }
    case "state-sales": {
      const map: Record<string, number> = {}
      for (const o of filteredOrders) {
        const { state } = cityStateFromProfile(o.buyer_id, profiles)
        map[state] = (map[state] || 0) + Number(o.total || 0)
      }
      const rows = Object.entries(map).map(([state, revenue]) => ({ state, revenue })).sort((a: any, b: any) => b.revenue - a.revenue)
      return { columns: [{ key: "state", label: "State" }, { key: "revenue", label: "Revenue" }], rows }
    }
    case "category-performance": {
      const rows = products
        .map((p: any) => {
          const inv = inventory.find((i: any) => i.product_id === p.id)
          const value = Number(p.price || 0) * (inv?.available_stock || 0)
          return { category: categoryMap[p.category_id] || "Uncategorized", value }
        })
        .reduce((acc: any[], r: any) => {
          const existing = acc.find((x) => x.category === r.category)
          if (existing) existing.value += r.value
          else acc.push(r)
          return acc
        }, [])
        .sort((a: any, b: any) => b.value - a.value)
      return { columns: [{ key: "category", label: "Category" }, { key: "value", label: "Value" }], rows }
    }
    case "brand-performance": {
      const rows = products
        .map((p: any) => {
          const inv = inventory.find((i: any) => i.product_id === p.id)
          const value = Number(p.price || 0) * (inv?.available_stock || 0)
          return { brand: brandMap[p.brand_id] || "Unbranded", value }
        })
        .reduce((acc: any[], r: any) => {
          const existing = acc.find((x) => x.brand === r.brand)
          if (existing) existing.value += r.value
          else acc.push(r)
          return acc
        }, [])
        .sort((a: any, b: any) => b.value - a.value)
      return { columns: [{ key: "brand", label: "Brand" }, { key: "value", label: "Value" }], rows }
    }
    default:
      throw new Error("Unknown report type")
  }
}

export async function getAuditReport(type: AuditReportType, filters: ReportFilters = {}) {
  await requireAdmin()
  switch (type) {
    case "admin-activities": {
      const { data, error } = await db.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100)
      if (error) throw error
      const rows = (data || []).filter((r: any) => !filters.from || new Date(r.created_at) >= new Date(filters.from))
      return { columns: [{ key: "action", label: "Action" }, { key: "entity_type", label: "Entity" }, { key: "status", label: "Status" }, { key: "created_at", label: "Date" }], rows }
    }
    case "dealer-activities": {
      const { data, error } = await db.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100)
      if (error) throw error
      const rows = (data || []).filter((r: any) => r.user_id)
      return { columns: [{ key: "action", label: "Action" }, { key: "entity_type", label: "Entity" }, { key: "status", label: "Status" }, { key: "created_at", label: "Date" }], rows }
    }
    case "login-history": {
      return { columns: [{ key: "info", label: "Info" }], rows: [{ info: "Login history requires auth audit extension" }] }
    }
    case "order-history": {
      const { data, error } = await db.from("activity_logs").select("*").eq("entity_type", "order").order("created_at", { ascending: false }).limit(100)
      if (error) throw error
      return { columns: [{ key: "action", label: "Action" }, { key: "status", label: "Status" }, { key: "created_at", label: "Date" }], rows: data || [] }
    }
    case "payment-history": {
      const { data, error } = await db.from("payment_audit_logs").select("*").order("created_at", { ascending: false }).limit(100)
      if (error) throw error
      return { columns: [{ key: "action", label: "Action" }, { key: "payment_id", label: "Payment" }, { key: "metadata", label: "Metadata" }, { key: "created_at", label: "Date" }], rows: data || [] }
    }
    case "inventory-changes": {
      const { data, error } = await db.from("activity_logs").select("*").eq("entity_type", "inventory").order("created_at", { ascending: false }).limit(100)
      if (error) throw error
      return { columns: [{ key: "action", label: "Action" }, { key: "status", label: "Status" }, { key: "metadata", label: "Metadata" }, { key: "created_at", label: "Date" }], rows: data || [] }
    }
    default:
      throw new Error("Unknown audit type")
  }
}

export async function getSavedFilters() {
  await requireAdmin()
  return [] as any[]
}

export async function saveFilter(_name: string, _filters: ReportFilters) {
  await requireAdmin()
  return { success: true, message: "Saved filters require a scheduled_reports table" }
}

export async function scheduleReport(_reportType: string, _frequency: string, _emails: string[]) {
  await requireAdmin()
  return { success: true, message: "Scheduled reports require a scheduled_reports table" }
}
