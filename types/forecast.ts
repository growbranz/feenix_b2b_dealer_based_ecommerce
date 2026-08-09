export interface ForecastPoint {
  label: string
  actual?: number
  predicted?: number
  lower?: number
  upper?: number
}

export interface ForecastResult {
  forecast: ForecastPoint[]
  nextPeriodValue: number
  growthRate: number
  confidenceInterval?: { lower: number; upper: number }
}

export interface InventoryRequirement {
  productId: string
  productName: string
  predictedDemand: number
  currentStock: number
  suggestedReorder: number
}

export interface LowStockPrediction {
  productId: string
  productName: string
  daysUntilStockout: number
  confidence: number
}
