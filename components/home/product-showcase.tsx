import { getPremiumProducts } from "@/lib/products/public"
import { ProductShowcaseClient } from "./ProductShowcaseClient"

export async function ProductShowcase() {
  const products = await getPremiumProducts(8)

  if (products.length === 0) {
    return null
  }

  return <ProductShowcaseClient products={products} />
}
