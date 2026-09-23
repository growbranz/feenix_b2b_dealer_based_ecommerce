"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { AddProductForm } from "@/components/dealer/add-product-form"
import { createProduct } from "@/lib/dealer/product-actions"

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
      const result = await createProduct(data)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create product")
      }

      alert("Product created as draft successfully!")
      router.push("/dealer/products")
      router.refresh()
    } catch (error: any) {
      console.error("Submit error:", error)
      alert(error?.message || "Failed to create product")
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
          Fill in the details to add a new product. Products are created as drafts and can be submitted for approval.
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
