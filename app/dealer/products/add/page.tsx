"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { AddProductForm } from "@/components/dealer/add-product-form"

interface Option {
  id: string
  name: string
}

export default function AddProductPage() {
  const router = useRouter()
  const [options, setOptions] = React.useState<{ categories: Option[]; brands: Option[]; models: Option[] }>({
    categories: [],
    brands: [],
    models: [],
  })
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()
    async function loadOptions() {
      const [categories, brands, models] = await Promise.all([
        supabase.from("categories").select("id, name").eq("status", "ACTIVE"),
        supabase.from("brands").select("id, name").eq("status", "ACTIVE"),
        supabase.from("models").select("id, name").eq("status", "ACTIVE"),
      ])

      if (categories.error) console.error("Error loading categories:", categories.error)
      if (brands.error) console.error("Error loading brands:", brands.error)
      if (models.error) console.error("Error loading models:", models.error)

      setOptions({
        categories: categories.data || [],
        brands: brands.data || [],
        models: models.data || [],
      })
      setIsLoading(false)
    }
    loadOptions()
  }, [])

  const handleSubmit = async (data: any) => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to publish a product")
      }

      const status = data.availability === "out_of_stock" ? "OUT_OF_STOCK" : "ACTIVE"

      const productPayload = {
        dealer_id: user.id,
        category_id: data.category_id,
        brand_id: data.brand_id,
        model_id: data.model_id,
        title: data.title,
        slug: slugify(data.title),
        sku: data.sku,
        description: data.description,
        price: data.price,
        bulk_price: typeof data.bulk_price === "number" && !Number.isNaN(data.bulk_price) ? data.bulk_price : null,
        stock: data.stock,
        minimum_order: data.minimum_order,
        warranty: data.warranty || null,
        status,
        featured: false,
      }

      const { data: product, error } = await (supabase
        .from("products") as any)
        .insert([productPayload])
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log("Product created:", product)
      alert("Product published successfully!")
      router.push("/dealer/products")
      router.refresh()
    } catch (error: any) {
      console.error("Submit error:", error)
      alert(error?.message || error?.error_description || "Failed to publish product")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the details to add a new product to your inventory
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
        />
      </motion.div>
    </div>
  )
}
