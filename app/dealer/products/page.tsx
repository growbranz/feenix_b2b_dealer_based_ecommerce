"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { ProductsTable } from "@/components/dealer/products-table"
import { ROUTES } from "@/constants/routes"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import type { RecentProduct } from "@/components/dealer/types"

export default function MyProductsPage() {
  const router = useRouter()
  const [products, setProducts] = React.useState<RecentProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [productToDelete, setProductToDelete] = React.useState<RecentProduct | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const loadProducts = React.useCallback(async () => {
    const supabase = createClient()
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
        price: p.price ?? 0,
        sku: p.sku || "",
        stock: p.stock,
        status: p.status,
      })))
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleView = (product: RecentProduct) => {
    router.push(`/dealer/products/${product.id}?mode=view`)
  }

  const handleEdit = (product: RecentProduct) => {
    router.push(`/dealer/products/${product.id}`)
  }

  const handleDuplicate = async (product: RecentProduct) => {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to duplicate a product")
      }

      const { data: original, error: productError }: any = await supabase
        .from("products")
        .select("*, images:product_images(image_url, display_order)")
        .eq("id", product.id)
        .eq("dealer_id", user.id)
        .single()

      if (productError || !original) {
        throw productError || new Error("Product not found")
      }

      const newTitle = `${original.title} (Copy)`
      const newSlug = slugify(newTitle)
      const newSku = original.sku ? `${original.sku}-${Date.now()}` : `SKU-${Date.now()}`

      const insertPayload = {
        dealer_id: user.id,
        category_id: original.category_id,
        brand_id: original.brand_id,
        model_id: original.model_id,
        title: newTitle,
        slug: newSlug,
        sku: newSku,
        description: original.description,
        price: original.price,
        bulk_price: original.bulk_price,
        stock: original.stock,
        minimum_order: original.minimum_order,
        warranty: original.warranty,
        status: original.status,
        featured: false,
      }

      const { data: newProduct, error: insertError } = await (supabase
        .from("products") as any)
        .insert([insertPayload])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      if (newProduct) {
        console.log("Product duplicated:", newProduct)
        alert("Product duplicated successfully!")
        await loadProducts()
      }
    } catch (error: any) {
      console.error("Duplicate error:", error)
      alert(error?.message || "Failed to duplicate product")
    }
  }

  const handleDeleteRequest = (product: RecentProduct) => {
    setProductToDelete(product)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("You must be logged in to delete a product")
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id)
        .eq("dealer_id", user.id)

      if (error) {
        throw error
      }

      setIsDeleteOpen(false)
      setProductToDelete(null)
      alert("Product deleted successfully!")
      await loadProducts()
    } catch (error: any) {
      console.error("Delete error:", error)
      alert(error?.message || "Failed to delete product")
    }
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
        <ProductsTable
          products={products}
          onView={handleView}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteRequest}
        />
      </motion.div>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
