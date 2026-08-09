import { z } from "zod"

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  dealerId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  adjustmentType: z.enum(["set", "add", "subtract"]),
  quantity: z.number().int().min(0, "Quantity must be a positive integer"),
  movementType: z.enum([
    "PURCHASE",
    "ADJUSTMENT",
    "DAMAGE",
    "LOST",
    "RETURN",
    "TRANSFER",
  ]),
  reason: z.string().min(3, "Reason is required").max(500),
})

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>

export const stockThresholdSchema = z.object({
  productId: z.string().uuid(),
  dealerId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  lowStockLimit: z.number().int().min(0),
  criticalStockLimit: z.number().int().min(0),
  recommendedReorderLevel: z.number().int().min(0),
})

export type StockThresholdInput = z.infer<typeof stockThresholdSchema>

export const inventoryTransferSchema = z
  .object({
    productId: z.string().uuid(),
    fromDealerId: z.string().uuid().optional(),
    fromWarehouseId: z.string().uuid().optional(),
    toDealerId: z.string().uuid().optional(),
    toWarehouseId: z.string().uuid().optional(),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    reason: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      (data.fromDealerId || data.fromWarehouseId) &&
      (data.toDealerId || data.toWarehouseId),
    {
      message: "Both source and destination locations are required",
    }
  )
  .refine(
    (data) =>
      !(
        data.fromDealerId &&
        data.toDealerId &&
        data.fromDealerId === data.toDealerId
      ) &&
      !(
        data.fromWarehouseId &&
        data.toWarehouseId &&
        data.fromWarehouseId === data.toWarehouseId
      ),
    {
      message: "Source and destination must be different",
    }
  )

export type InventoryTransferInput = z.infer<typeof inventoryTransferSchema>
