import type {
  Inventory,
  InventoryLedger,
  InventoryTransfer,
  LowStockAlert,
  Warehouse,
} from "@/types"

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "pre_order"

export interface InventoryItem extends Inventory {
  product: {
    id: string
    title: string
    slug: string
    price: number
    sku?: string
    status: string
    dealer_id: string
    category: { name: string }
    brand: { name: string }
    model: { name: string }
    images: { image_url: string; display_order: number }[]
    dealer?: { business_name: string | null; name: string }
  }
  stock_status: StockStatus
  stock: number
  total_stock: number
  minimum_stock: number
  inventory_value: number
  reserved_value: number
  category_name: string
  brand_name: string
  model_name: string
  dealer_name: string
  image?: string
}

export interface InventoryListItem {
  id: string
  product_id: string
  title: string
  sku: string
  brand: string
  model: string
  category: string
  price: number
  stock: number
  total_stock: number
  minimum_stock: number
  stock_status: StockStatus
  product_status: string
  dealer: string
  image?: string
  updated_at: string
}

export interface InventoryStats {
  total_stock: number
  available_stock: number
  reserved_stock: number
  low_stock: number
  out_of_stock: number
  inventory_value: number
  reserved_value: number
  todays_movement: number
}

export interface InventoryDashboardData {
  stats: InventoryStats
  items: InventoryListItem[]
  alerts: LowStockAlert[]
  recentLedger: InventoryLedger[]
}

export interface InventoryFilterOptions {
  search?: string
  category?: string
  brand?: string
  status?: string
  lowStock?: boolean
  page?: number
  limit?: number
  dealerId?: string
  warehouseId?: string
  productId?: string
  orderId?: string
  movementType?: string
  level?: string
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface TransferRequest {
  product_id: string
  from_dealer_id?: string
  from_warehouse_id?: string
  to_dealer_id?: string
  to_warehouse_id?: string
  quantity: number
  reason?: string
}

export interface TransferWithDetails extends InventoryTransfer {
  product: { title: string; slug: string }
  from_dealer?: { business_name: string | null; name: string }
  to_dealer?: { business_name: string | null; name: string }
  from_warehouse?: { name: string }
  to_warehouse?: { name: string }
  requested_by_profile?: { name: string }
}

export interface LedgerWithDetails extends InventoryLedger {
  product: { title: string; slug: string }
  dealer?: { business_name: string | null; name: string }
  warehouse?: { name: string }
  order?: { order_number: string }
  user?: { name: string }
}

export interface AlertWithDetails extends LowStockAlert {
  product: { title: string; slug: string }
  dealer?: { business_name: string | null; name: string }
  warehouse?: { name: string }
}

export interface MovementSummary {
  date: string
  in: number
  out: number
}

export interface ReportProduct {
  id: string
  title: string
  sku?: string
  total_quantity: number
  total_value: number
  movement_count: number
  last_movement_at: string | null
}
