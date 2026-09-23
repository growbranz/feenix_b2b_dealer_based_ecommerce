import { createServerClient } from "@/lib/supabase/server"

export interface PublicProduct {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  stock: number
  condition: string | null
  quality: string | null
  warranty: string | null
  featured: boolean
  created_at: string
  updated_at: string
  dealer_name: string
  dealer_city: string | null
  dealer_state: string | null
  brand_name: string
  category_name: string
  model_name: string
  images: string[]
}

export async function getFeaturedProducts(limit: number = 8): Promise<PublicProduct[]> {
  try {
    const supabase = await createServerClient()
    
    // Fetch featured products that are active (publicly visible)
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        slug,
        description,
        price,
        stock,
        condition,
        quality,
        warranty,
        featured,
        status,
        created_at,
        updated_at,
        dealer:profiles(business_name, city, state),
        brand:brands(name),
        category:categories(name),
        model:models(name),
        images:product_images(image_url)
      `)
      .eq("featured", true)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Failed to fetch featured products:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    if (!data || data.length === 0) {
      console.log("No featured products found - returning empty array")
      return []
    }

    const products: PublicProduct[] = data.map((product: any) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      condition: product.condition,
      quality: product.quality,
      warranty: product.warranty,
      featured: product.featured,
      created_at: product.created_at,
      updated_at: product.updated_at,
      dealer_name: product.dealer?.business_name || "Unknown Dealer",
      dealer_city: product.dealer?.city,
      dealer_state: product.dealer?.state,
      brand_name: product.brand?.name || "",
      category_name: product.category?.name || "",
      model_name: product.model?.name || "",
      images: (product.images || []).map((img: any) => img.image_url),
    }))

    return products
  } catch (error) {
    console.error("Failed to fetch featured products:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    })
    return []
  }
}

export async function getPremiumProducts(limit: number = 8): Promise<PublicProduct[]> {
  try {
    const supabase = await createServerClient()
    
    // Fetch premium products that are active (publicly visible)
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        title,
        slug,
        description,
        price,
        stock,
        condition,
        quality,
        warranty,
        featured,
        premium,
        premium_display_order,
        status,
        created_at,
        updated_at,
        dealer:profiles(business_name, city, state),
        brand:brands(name),
        category:categories(name),
        model:models(name),
        images:product_images(image_url)
      `)
      .eq("premium", true)
      .eq("status", "ACTIVE")
      .order("premium_display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Failed to fetch premium products:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    if (!data || data.length === 0) {
      console.log("No premium products found - returning empty array")
      return []
    }

    const products: PublicProduct[] = data.map((product: any) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      condition: product.condition,
      quality: product.quality,
      warranty: product.warranty,
      featured: product.featured,
      created_at: product.created_at,
      updated_at: product.updated_at,
      dealer_name: product.dealer?.business_name || "Unknown Dealer",
      dealer_city: product.dealer?.city,
      dealer_state: product.dealer?.state,
      brand_name: product.brand?.name || "",
      category_name: product.category?.name || "",
      model_name: product.model?.name || "",
      images: (product.images || []).map((img: any) => img.image_url),
    }))

    return products
  } catch (error) {
    console.error("Failed to fetch premium products:", {
      message: error instanceof Error ? error.message : String(error),
      error,
    })
    return []
  }
}
