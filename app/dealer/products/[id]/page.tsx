"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { AddProductForm } from "@/components/dealer/add-product-form"
import { adjustStock, ensureInventoryForProduct } from "@/lib/inventory/actions"

interface Option {
  id: string
  name: string
}

function statusToAvailability(status: string): string {
  if (status === "OUT_OF_STOCK") return "out_of_stock"
  return "in_stock"
}

function availabilityToStatus(availability: string): string {
  if (availability === "out_of_stock") return "OUT_OF_STOCK"
  return "ACTIVE"
}

function productToFormDefaults(product: any): any {
  const images = product.images || []
  return {
    category_id: product.category_id || "",
    brand_id: product.brand_id || "",
    model_id: product.model_id || "",
    title: product.title || "",
    sku: product.sku || "",
    oem_number: "",
    compatible_models: "",
    description: product.description || "",
    price: product.price ?? 0,
    bulk_price: product.bulk_price ?? undefined,
    discount: 0,
    tax: 0,
    warranty: product.warranty || "",
    stock: product.stock ?? 0,
    minimum_order: product.minimum_order ?? 1,
    warehouse: "",
    availability: statusToAvailability(product.status),
    images: images.map((img: any) => img.image_url) || [],
  }
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = params.id as string
  const isView = searchParams.get("mode") === "view"

  const [product, setProduct] = React.useState<any>(null)
  const [options, setOptions] = React.useState<{ categories: Option[]; brands: Option[]; models: Option[] }>({
    categories: [],
    brands: [],
    models: [],
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const initialValues = React.useMemo(() => {
    if (!product) return null
    return productToFormDefaults(product)
  }, [product])

  React.useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, productResult, categories, brands, models]: any[] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("products").select("*, images:product_images(image_url, display_order)").eq("id", productId).single(),
        supabase.from("categories").select("id, name").eq("status", "ACTIVE"),
        supabase.from("brands").select("id, name").eq("status", "ACTIVE"),
        supabase.from("models").select("id, name").eq("status", "ACTIVE"),
      ])

      if (productResult.error || !productResult.data) {
        setError(productResult.error?.message || "Product not found")
        setIsLoading(false)
        return
      }

      if (productResult.data.dealer_id !== user?.id) {
        setError("You do not have permission to view this product")
        setIsLoading(false)
        return
      }

      setProduct(productResult.data)
      setOptions({
        categories: categories.data || [],
        brands: brands.data || [],
        models: models.data || [],
      })
      setIsLoading(false)
    }
    load()
  }, [productId])

  const handleSubmit = async (data: any) => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to update this product")
      }

      console.log("PRODUCT UPDATE START", { productId, hasImages: data.images?.length > 0 })

      const updatePayload = {
        category_id: data.category_id,
        brand_id: data.brand_id,
        model_id: data.model_id,
        title: data.title,
        slug: slugify(data.title),
        sku: data.sku,
        description: data.description,
        price: data.price,
        bulk_price: typeof data.bulk_price === "number" && !Number.isNaN(data.bulk_price) ? data.bulk_price : null,
        minimum_order: data.minimum_order,
        warranty: data.warranty || null,
        status: availabilityToStatus(data.availability),
      }

      const { data: updated, error } = await (supabase.from("products") as any)
        .update(updatePayload)
        .eq("id", productId)
        .eq("dealer_id", user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log("PRODUCT UPDATE FIELDS SUCCESS", { productId })

      // Handle images - sync with database
      if (data.images) {
        console.log("PRODUCT IMAGES SYNC START", {
          productId,
          newImageCount: data.images.length,
        })

        // Get existing images
        const { data: existingImages, error: existingError } = await supabase
          .from("product_images")
          .select("id, image_url")
          .eq("product_id", productId)

        if (existingError) {
          console.error("PRODUCT IMAGES: Failed to fetch existing images", existingError)
        } else {
          console.log("PRODUCT IMAGES: Existing images", {
            productId,
            existingCount: existingImages?.length || 0,
          })

          // Remove images that are no longer in the form
          const existingUrls = existingImages?.map((img: any) => img.image_url) || []
          const newUrls = data.images
          
          const toRemove = existingUrls.filter((url: string) => !newUrls.includes(url))
          
          if (toRemove.length > 0) {
            console.log("PRODUCT IMAGES: Removing old images", {
              productId,
              removeCount: toRemove.length,
            })

            // Remove from database
            const { error: removeError } = await supabase
              .from("product_images")
              .delete()
              .in("image_url", toRemove)

            if (removeError) {
              console.error("PRODUCT IMAGES: Failed to remove from database", removeError)
            }

            // Remove from Storage
            for (const url of toRemove) {
              if (url.includes("/product-images/")) {
                try {
                  const path = url.split("/product-images/")[1].split("?")[0]
                  await supabase.storage.from("product-images").remove([path])
                  console.log("PRODUCT IMAGES: Removed from Storage", { path })
                } catch (storageError) {
                  console.error("PRODUCT IMAGES: Failed to remove from Storage", storageError)
                }
              }
            }
          }

          // Add new images
          const toAdd = newUrls.filter((url: string) => !existingUrls.includes(url))
          
          if (toAdd.length > 0) {
            console.log("PRODUCT IMAGES: Adding new images", {
              productId,
              addCount: toAdd.length,
            })

            const newImagePayloads = toAdd.map((url: string, index: number) => ({
              product_id: productId,
              image_url: url,
              display_order: existingUrls.length + index,
            }))

            const { error: insertError } = await supabase
              .from("product_images")
              .insert(newImagePayloads)

            if (insertError) {
              console.error("PRODUCT IMAGES: Failed to insert new images", insertError)
              throw new Error(`Failed to save product images: ${insertError.message}`)
            }
          }

          // Update display order for all images
          for (const [index, url] of data.images.entries()) {
            await (supabase
              .from("product_images") as any)
              .update({ display_order: index })
              .eq("product_id", productId)
              .eq("image_url", url)
          }

          console.log("PRODUCT IMAGES SYNC SUCCESS", {
            productId,
            finalImageCount: data.images.length,
          })
        }
      }

      const originalStock = Math.max(0, Number.parseInt(String(product?.stock ?? 0), 10) || 0)
      const newStock = Math.max(0, Number.parseInt(String(data.stock ?? 0), 10) || 0)
      if (product && originalStock !== newStock) {
        await ensureInventoryForProduct(productId, user.id, originalStock)
        await adjustStock({
          productId,
          dealerId: user.id,
          adjustmentType: "set",
          quantity: newStock,
          movementType: "ADJUSTMENT",
          reason: "Stock updated from product edit",
        })
      }

      console.log("PRODUCT UPDATE COMPLETE SUCCESS", { productId })
      alert("Product updated successfully!")
      router.push("/dealer/products")
      router.refresh()
    } catch (error: any) {
      console.error("Update error:", error)
      alert(error?.message || "Failed to update product")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-12 text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/dealer/products")}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-12 text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The product you are looking for does not exist.
          </p>
          <button
            onClick={() => router.push("/dealer/products")}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  if (isView) {
    const image = product.images?.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.image_url || null
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            <p className="mt-2 text-muted-foreground">Product details</p>
          </div>
          <Button onClick={() => router.push(`/dealer/products/${productId}`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-sm space-y-6"
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={product.title} className="h-64 w-full rounded-2xl object-cover" />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><span className="text-sm text-muted-foreground">SKU</span><p className="font-medium">{product.sku}</p></div>
            <div><span className="text-sm text-muted-foreground">Price</span><p className="font-medium">₹{product.price}</p></div>
            <div><span className="text-sm text-muted-foreground">Bulk Price</span><p className="font-medium">{product.bulk_price ? `₹${product.bulk_price}` : "—"}</p></div>
            <div><span className="text-sm text-muted-foreground">Stock</span><p className="font-medium">{product.stock}</p></div>
            <div><span className="text-sm text-muted-foreground">Minimum Order</span><p className="font-medium">{product.minimum_order}</p></div>
            <div><span className="text-sm text-muted-foreground">Warranty</span><p className="font-medium">{product.warranty || "—"}</p></div>
            <div><span className="text-sm text-muted-foreground">Status</span><p className="font-medium">{product.status}</p></div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Description</span>
            <p className="mt-1">{product.description}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="mt-2 text-muted-foreground">
          Update the product details for {product.title}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AddProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          categories={options.categories}
          brands={options.brands}
          models={options.models}
          isLoading={isLoading}
          initialValues={initialValues}
          mode="edit"
          productId={productId}
        />
      </motion.div>
    </div>
  )
}
