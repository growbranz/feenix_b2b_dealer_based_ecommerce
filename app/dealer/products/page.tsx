"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/dealer/products-table"
import { ROUTES } from "@/constants/routes"
import { createClient } from "@/lib/supabase/client"
import type { RecentProduct } from "@/components/dealer/types"

export default function MyProductsPage() {
  const router = useRouter()
  const [products, setProducts] = React.useState<RecentProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedProduct, setSelectedProduct] = React.useState<RecentProduct | null>(null)

  React.useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          brand:brands(name),
          model:models(name),
          category:categories(name),
          images:product_images(image_url, display_order)
        `)
        .eq("dealer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading products:", error)
      } else {
        const rows: any[] = data || []
        setProducts(rows.map((p) => ({
          id: p.id,
          title: p.title,
          image: p.images?.length
            ? p.images.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.image_url
            : null,
          brand: p.brand?.name || "",
          model: p.model?.name || "",
          category: p.category?.name || "",
          stock: p.stock,
          status: p.status,
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleRowClick = (product: RecentProduct) => {
    setSelectedProduct(product)
    // TODO: Open product details drawer
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your product listings and inventory
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.DEALER_ADD_PRODUCT)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ProductsTable products={products} onRowClick={handleRowClick} />
      </motion.div>
    </div>
  )
}
