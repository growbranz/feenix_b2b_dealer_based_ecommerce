"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { AddProductForm } from "@/components/dealer/add-product-form"
import { recentProducts } from "@/components/dealer/data"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // TODO: Fetch product from Supabase
    // For now, use dummy data
    const foundProduct = recentProducts.find((p) => p.id === productId)
    setProduct(foundProduct || null)
    setIsLoading(false)
  }, [productId])

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Implement Supabase update
      console.log("Updating product:", productId, data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Product updated successfully!")
      router.push("/dealer/products")
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update product")
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

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-12 text-center">
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist.
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
        <AddProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </motion.div>
    </div>
  )
}
