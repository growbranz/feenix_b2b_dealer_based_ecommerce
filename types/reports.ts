export type AdvancedReportType =
  | 'dealer-performance'
  | 'customer-lifetime-value'
  | 'repeat-customers'
  | 'sales-funnel'
  | 'enquiry-conversion'
  | 'order-completion'
  | 'refund-analysis'
  | 'payment-failure'
  | 'inventory-turnover'
  | 'product-performance'
  | 'city-sales'
  | 'state-sales'
  | 'category-performance'
  | 'brand-performance'

export type AuditReportType =
  | 'admin-activities'
  | 'dealer-activities'
  | 'login-history'
  | 'order-history'
  | 'payment-history'
  | 'inventory-changes'

export interface ReportFilters {
  from?: string
  to?: string
  dealerId?: string
  city?: string
  state?: string
  categoryId?: string
  brandId?: string
  status?: string
  limit?: number
  page?: number
}

export interface ExecutiveKpis {
  businessHealthScore: number
  monthlyGrowth: number
  quarterlyGrowth: number
  yearlyGrowth: number
  revenueForecast: number
  profitEstimate: number
  outstandingPayments: number
  pendingRefunds: number
}

export interface RankedItem {
  id?: string
  name: string
  value: number
  metric?: string
}

export interface InventoryStatus {
  fastMoving: any[]
  slowMoving: any[]
  deadStock: any[]
}

export interface ExecutiveDashboardData {
  kpis: ExecutiveKpis
  topDealers: RankedItem[]
  lowestDealers: RankedItem[]
  topCustomers: RankedItem[]
  topProducts: RankedItem[]
  topCategories: RankedItem[]
  topBrands: RankedItem[]
  inventoryStatus: InventoryStatus
  outstandingPayments: any[]
  pendingRefunds: any[]
}
