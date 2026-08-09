export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "pre_order"
export type ProductStatus = "draft" | "pending_approval" | "published" | "inactive" | "out_of_stock" | "archived"

export interface InventoryItem {
  id: string
  title: string
  sku: string
  brand: string
  model: string
  category: string
  price: number
  stock: number
  minimum_stock: number
  stock_status: StockStatus
  product_status: ProductStatus
  image?: string
  created_at: string
  updated_at: string
}

export interface StockHistoryEntry {
  id: string
  product_id: string
  product_title: string
  action: "increase" | "decrease" | "adjustment" | "sale" | "return"
  quantity: number
  previous_stock: number
  new_stock: number
  reason: string
  created_at: string
  created_by: string
}

export interface StatusTimelineEntry {
  id: string
  status: ProductStatus
  changed_at: string
  changed_by: string
  reason?: string
}

export interface InventoryStats {
  total_stock: number
  available_stock: number
  low_stock_count: number
  out_of_stock_count: number
  inventory_value: number
}
