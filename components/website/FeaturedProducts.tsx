import { getFeaturedProducts } from "@/lib/products/public"
import { FeaturedProductsClient } from "./FeaturedProductsClient"

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(8)

  if (products.length === 0) {
    return null
  }

  return <FeaturedProductsClient products={products} />
}
