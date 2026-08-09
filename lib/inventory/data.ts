"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getStockStatus } from "@/lib/inventory/utils"
import type {
  InventoryListItem,
  InventoryStats,
  InventoryFilterOptions,
  PaginatedResult,
  LedgerWithDetails,
  TransferWithDetails,
  AlertWithDetails,
  MovementSummary,
  ReportProduct,
} from "@/types/inventory"
import type { InventoryMovementType } from "@/types"

const NIL_UUID = "00000000-0000-0000-0000-000000000000"

function coalesceId(id: string | null | undefined): string {
  return id || NIL_UUID
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0]
}

function buildInventoryBaseQuery(supabase: Awaited<ReturnType<typeof createServerClient>>) {
  return supabase.from("inventory").select(
    `*,
    product:products!inner(
      title,
      slug,
      sku,
      price,
      status,
      dealer_id,
      category:categories(name),
      brand:brands(name),
      model:models(name),
      images:product_images(image_url, display_order),
      dealer:profiles!inner(name, business_name)
    )`,
    { count: "exact" }
  )
}

export async function getInventoryStats(options: { dealerId?: string; warehouseId?: string } = {}): Promise<InventoryStats> {
  const supabase = await createServerClient()
  let query = buildInventoryBaseQuery(supabase)

  if (options.dealerId) {
    query = query.eq("dealer_id", options.dealerId)
  } else if (options.warehouseId) {
    query = query.eq("warehouse_id", options.warehouseId)
  }

  const { data, error } = await query
  if (error) {
    console.error("getInventoryStats error:", error)
    return {
      total_stock: 0,
      available_stock: 0,
      reserved_stock: 0,
      low_stock: 0,
      out_of_stock: 0,
      inventory_value: 0,
      reserved_value: 0,
      todays_movement: 0,
    }
  }

  const rows = (data || []) as any[]
  let total_stock = 0
  let available_stock = 0
  let reserved_stock = 0
  let low_stock = 0
  let out_of_stock = 0
  let inventory_value = 0
  let reserved_value = 0

  for (const row of rows) {
    const available = row.available_stock || 0
    const reserved = row.reserved_stock || 0
    const price = Number(row.product?.price || 0)
    total_stock += available + reserved
    available_stock += available
    reserved_stock += reserved
    inventory_value += available * price
    reserved_value += reserved * price

    if (available === 0) out_of_stock += 1
    else if (available <= (row.low_stock_limit || 10)) low_stock += 1
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: ledgerData, error: ledgerError } = await supabase
    .from("inventory_ledger")
    .select("previous_quantity, updated_quantity, created_at")
    .gte("created_at", today.toISOString())

  if (ledgerError) {
    console.error("getInventoryStats ledger error:", ledgerError)
  }

  const todays_movement = (ledgerData || []).reduce((sum: number, entry: any) => {
    return sum + Math.abs((entry.updated_quantity || 0) - (entry.previous_quantity || 0))
  }, 0)

  return {
    total_stock,
    available_stock,
    reserved_stock,
    low_stock,
    out_of_stock,
    inventory_value,
    reserved_value,
    todays_movement,
  }
}

export async function getInventoryItems(
  options: InventoryFilterOptions = {}
): Promise<PaginatedResult<InventoryListItem>> {
  const {
    search,
    category,
    brand,
    status,
    lowStock,
    page = 1,
    limit = 20,
    dealerId,
    warehouseId,
  } = options

  const supabase = await createServerClient()
  let query = buildInventoryBaseQuery(supabase)

  if (dealerId) query = query.eq("dealer_id", dealerId)
  if (warehouseId) query = query.eq("warehouse_id", warehouseId)

  if (category) {
    query = query.eq("product.category.name", category)
  }
  if (brand) {
    query = query.eq("product.brand.name", brand)
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1).order("updated_at", { ascending: false })

  const { data, count, error } = await query
  if (error) {
    console.error("getInventoryItems error:", error)
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  const rows = (data || []) as any[]
  const items: InventoryListItem[] = rows.map((row) => {
    const product = row.product as any
    const categoryName = product?.category?.name || ""
    const brandName = product?.brand?.name || ""
    const modelName = product?.model?.name || ""
    const dealerName = product?.dealer?.business_name || product?.dealer?.name || ""
    const available = row.available_stock || 0
    const reserved = row.reserved_stock || 0
    const lowLimit = row.low_stock_limit || 10
    const criticalLimit = row.critical_stock_limit || 5
    const images = product?.images || []
    const primaryImage = images.find((img: any) => img.display_order === 0)?.image_url || images[0]?.image_url

    return {
      id: row.id,
      product_id: row.product_id,
      title: product?.title || "",
      sku: product?.sku || product?.slug || "",
      brand: brandName,
      model: modelName,
      category: categoryName,
      price: Number(product?.price || 0),
      stock: available,
      total_stock: available + reserved,
      minimum_stock: lowLimit,
      stock_status: getStockStatus(available, lowLimit, criticalLimit),
      product_status: product?.status || "INACTIVE",
      dealer: dealerName,
      image: primaryImage,
      updated_at: row.updated_at,
    }
  })

  let filtered = items
  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q)
    )
  }

  if (status && status !== "all") {
    filtered = filtered.filter((i) => i.stock_status === status)
  }

  if (lowStock) {
    filtered = filtered.filter((i) => i.stock_status === "low_stock" || i.stock_status === "out_of_stock")
  }

  const totalCount = (count || 0)
  const totalPages = Math.ceil(totalCount / limit) || 1
  return { data: filtered, count: totalCount, page, limit, totalPages }
}

export async function getInventoryLedger(
  options: InventoryFilterOptions = {}
): Promise<PaginatedResult<LedgerWithDetails>> {
  const { productId, dealerId, orderId, movementType, page = 1, limit = 20 } = options as any
  const supabase = await createServerClient()
  let query = supabase
    .from("inventory_ledger")
    .select(
      `*,
      product:products!inner(title, slug),
      dealer:profiles!inventory_ledger_dealer_id_fkey(name, business_name),
      warehouse:warehouses!inventory_ledger_warehouse_id_fkey(name),
      order:orders!inventory_ledger_order_id_fkey(order_number),
      user:profiles!inventory_ledger_user_id_fkey(name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (productId) query = query.eq("product_id", productId)
  if (dealerId) query = query.eq("dealer_id", dealerId)
  if (orderId) query = query.eq("order_id", orderId)
  if (movementType) query = query.eq("movement_type", movementType)

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) {
    console.error("getInventoryLedger error:", error)
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  const rows = (data || []) as any[]
  const mapped: LedgerWithDetails[] = rows.map((r) => ({
    ...r,
    product: r.product,
    dealer: r.dealer,
    warehouse: r.warehouse,
    order: r.order,
    user: r.user,
  }))

  return {
    data: mapped,
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1,
  }
}

export async function getInventoryTransfers(
  options: InventoryFilterOptions = {}
): Promise<PaginatedResult<TransferWithDetails>> {
  const { status, productId, page = 1, limit = 20, dealerId } = options as any
  const supabase = await createServerClient()
  let query = supabase
    .from("inventory_transfers")
    .select(
      `*,
      product:products!inner(title, slug),
      from_dealer:profiles!inventory_transfers_from_dealer_id_fkey(name, business_name),
      to_dealer:profiles!inventory_transfers_to_dealer_id_fkey(name, business_name),
      from_warehouse:warehouses!inventory_transfers_from_warehouse_id_fkey(name),
      to_warehouse:warehouses!inventory_transfers_to_warehouse_id_fkey(name),
      requested_by_profile:profiles!inventory_transfers_requested_by_fkey(name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)
  if (productId) query = query.eq("product_id", productId)
  if (dealerId) {
    query = query.or(`from_dealer_id.eq.${dealerId},to_dealer_id.eq.${dealerId}`)
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) {
    console.error("getInventoryTransfers error:", error)
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  const rows = (data || []) as any[]
  return {
    data: rows as TransferWithDetails[],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1,
  }
}

export async function getLowStockAlerts(
  options: InventoryFilterOptions = {}
): Promise<PaginatedResult<AlertWithDetails>> {
  const { dealerId, warehouseId, level, page = 1, limit = 20 } = options as any
  const supabase = await createServerClient()
  let query = supabase
    .from("low_stock_alerts")
    .select(
      `*,
      product:products!inner(title, slug),
      dealer:profiles!low_stock_alerts_dealer_id_fkey(name, business_name),
      warehouse:warehouses!low_stock_alerts_warehouse_id_fkey(name)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (dealerId) query = query.eq("dealer_id", dealerId)
  if (warehouseId) query = query.eq("warehouse_id", warehouseId)
  if (level) query = query.eq("alert_level", level)

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) {
    console.error("getLowStockAlerts error:", error)
    return { data: [], count: 0, page, limit, totalPages: 0 }
  }

  const rows = (data || []) as any[]
  return {
    data: rows as AlertWithDetails[],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1,
  }
}

export async function getInventoryMovementSummary(days = 14): Promise<MovementSummary[]> {
  const supabase = await createServerClient()
  const start = new Date()
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("inventory_ledger")
    .select("previous_quantity, updated_quantity, created_at, movement_type")
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    console.error("getInventoryMovementSummary error:", error)
    return []
  }

  const rows = (data || []) as any[]
  const map = new Map<string, { in: number; out: number }>()

  for (const row of rows) {
    const date = formatDate(new Date(row.created_at))
    const delta = (row.updated_quantity || 0) - (row.previous_quantity || 0)
    const entry = map.get(date) || { in: 0, out: 0 }
    if (delta > 0) entry.in += delta
    if (delta < 0) entry.out += Math.abs(delta)
    map.set(date, entry)
  }

  const result: MovementSummary[] = []
  for (let i = 0; i <= days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const date = formatDate(d)
    const entry = map.get(date) || { in: 0, out: 0 }
    result.push({ date, in: entry.in, out: entry.out })
  }

  return result
}

export async function getProductMovementReport(
  type: "fast" | "slow" | "dead",
  limit = 20
): Promise<ReportProduct[]> {
  const supabase = await createServerClient()

  if (type === "fast") {
    const { data, error } = await supabase
      .from("inventory_ledger")
      .select(
        `quantity_move: ABS(updated_quantity - previous_quantity),
        product:products!inner(id, title, slug, sku, price)`
      )
      .eq("movement_type", "SALE")
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("getProductMovementReport fast error:", error)
      return []
    }

    const agg = new Map<string, ReportProduct>()
    for (const row of (data || []) as any[]) {
      const p = row.product
      const existing = agg.get(p.id) || {
        id: p.id,
        title: p.title,
        sku: p.sku || p.slug,
        total_quantity: 0,
        total_value: 0,
        movement_count: 0,
        last_movement_at: null,
      }
      existing.total_quantity += Number(row.quantity_move || 0)
      existing.total_value += Number(row.quantity_move || 0) * Number(p.price || 0)
      existing.movement_count += 1
      agg.set(p.id, existing)
    }

    return Array.from(agg.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit)
  }

  // Slow / dead: products with inventory but few/no recent sales
  const cutoff = new Date()
  if (type === "dead") cutoff.setDate(cutoff.getDate() - 90)
  else cutoff.setDate(cutoff.getDate() - 30)

  const { data: products, error: productError } = await supabase
    .from("inventory")
    .select(
      `*,
      product:products!inner(id, title, slug, sku, price, status, dealer:profiles(name, business_name))`
    )
    .gt("available_stock", 0)
    .limit(1000)

  if (productError) {
    console.error("getProductMovementReport products error:", productError)
    return []
  }

  const productIds = ((products || []) as any[]).map((r) => r.product_id)
  const { data: sales, error: salesError } = await supabase
    .from("inventory_ledger")
    .select("product_id, created_at")
    .eq("movement_type", "SALE")
    .in("product_id", productIds)
    .order("created_at", { ascending: false })

  if (salesError) {
    console.error("getProductMovementReport sales error:", salesError)
    return []
  }

  const lastSaleMap = new Map<string, string>()
  for (const row of (sales || []) as any[]) {
    if (!lastSaleMap.has(row.product_id)) {
      lastSaleMap.set(row.product_id, row.created_at)
    }
  }

  const result: ReportProduct[] = ((products || []) as any[]).map((r) => {
    const p = r.product
    const lastMovement = lastSaleMap.get(p.id) || null
    return {
      id: p.id,
      title: p.title,
      sku: p.sku || p.slug,
      total_quantity: r.available_stock + r.reserved_stock,
      total_value: (r.available_stock + r.reserved_stock) * Number(p.price || 0),
      movement_count: sales?.filter((s: any) => s.product_id === p.id).length || 0,
      last_movement_at: lastMovement,
    }
  })

  const cutoffStr = cutoff.toISOString()
  if (type === "dead") {
    return result
      .filter((r) => !r.last_movement_at || r.last_movement_at < cutoffStr)
      .sort((a, b) => (a.last_movement_at || cutoffStr).localeCompare(b.last_movement_at || cutoffStr))
      .slice(0, limit)
  }

  return result
    .filter((r) => !r.last_movement_at || r.last_movement_at < cutoffStr)
    .sort((a, b) => a.movement_count - b.movement_count)
    .slice(0, limit)
}

export async function getDealerInventoryReport(): Promise<
  { dealer_id: string; dealer_name: string; total_stock: number; total_value: number; reserved_stock: number }[]
> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("inventory")
    .select(
      `*,
      product:products!inner(price, dealer:profiles(id, name, business_name))`
    )
    .not("dealer_id", "is", null)
    .limit(2000)

  if (error) {
    console.error("getDealerInventoryReport error:", error)
    return []
  }

  const map = new Map<string, { dealer_id: string; dealer_name: string; total_stock: number; total_value: number; reserved_stock: number }>()
  for (const row of (data || []) as any[]) {
    const dealer = row.product?.dealer
    const id = dealer?.id || row.dealer_id || NIL_UUID
    const existing = map.get(id) || {
      dealer_id: id,
      dealer_name: dealer?.business_name || dealer?.name || "Unknown",
      total_stock: 0,
      total_value: 0,
      reserved_stock: 0,
    }
    const qty = (row.available_stock || 0) + (row.reserved_stock || 0)
    existing.total_stock += qty
    existing.total_value += qty * Number(row.product?.price || 0)
    existing.reserved_stock += row.reserved_stock || 0
    map.set(id, existing)
  }

  return Array.from(map.values()).sort((a, b) => b.total_value - a.total_value)
}
