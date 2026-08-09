import { z } from "zod"

export const productBasicInfoSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  brand_id: z.string().min(1, "Brand is required"),
  model_id: z.string().min(1, "Model is required"),
  title: z.string().min(3, "Product name must be at least 3 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  oem_number: z.string().optional(),
  compatible_models: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
})

export const productPricingSchema = z.object({
  price: z.number().min(1, "Price must be greater than 0"),
  bulk_price: z.number().optional(),
  discount: z.number().min(0).max(100).optional(),
  tax: z.number().min(0).max(100).optional(),
  warranty: z.string().optional(),
})

export const productInventorySchema = z.object({
  stock: z.number().min(0, "Stock cannot be negative"),
  minimum_order: z.number().min(1, "Minimum order must be at least 1"),
  warehouse: z.string().optional(),
  availability: z.enum(["in_stock", "out_of_stock", "pre_order"]),
})

export const productImagesSchema = z.object({
  images: z.array(z.string()).min(1, "At least one image is required"),
})

export const productSchema = z.object({
  ...productBasicInfoSchema.shape,
  ...productPricingSchema.shape,
  ...productInventorySchema.shape,
  ...productImagesSchema.shape,
})

export type ProductBasicInfoFormData = z.infer<typeof productBasicInfoSchema>
export type ProductPricingFormData = z.infer<typeof productPricingSchema>
export type ProductInventoryFormData = z.infer<typeof productInventorySchema>
export type ProductImagesFormData = z.infer<typeof productImagesSchema>
export type ProductFormData = z.infer<typeof productSchema>
