export type ReportType =
  | 'revenue'
  | 'orders'
  | 'payments'
  | 'inventory'
  | 'dealers'
  | 'customers'
  | 'products'
  | 'categories'
  | 'brands'
  | 'tax'
  | 'refunds'

export interface AnalyticsFilters {
  from?: string
  to?: string
  dealerId?: string
  categoryId?: string
  brandId?: string
  city?: string
  paymentStatus?: string
  orderStatus?: string
}

export interface DashboardStats {
  totalRevenue: number
  todayRevenue: number
  monthlyRevenue: number
  annualRevenue: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalCustomers: number
  activeDealers: number
  totalProducts: number
  inventoryValue: number
  lowStockProducts: number
  paymentSuccessRate: number
  averageOrderValue: number
  averageDealerResponseTime: number
  averageDeliveryTime: number
}

export interface TrendPoint {
  label: string
  value: number
  [key: string]: any
}

export interface DealerPerformancePoint {
  name: string
  revenue: number
  orders: number
}

export interface TopProductPoint {
  name: string
  value: number
}

export interface ReportRow {
  [key: string]: any
}
