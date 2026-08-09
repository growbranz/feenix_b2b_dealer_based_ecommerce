import type { InventoryListItem } from "@/types/inventory"

export function getStockStatus(
  available: number,
  lowLimit: number,
  criticalLimit: number
): InventoryListItem["stock_status"] {
  if (available === 0) return "out_of_stock"
  if (available <= criticalLimit) return "low_stock"
  if (available <= lowLimit) return "low_stock"
  return "in_stock"
}
