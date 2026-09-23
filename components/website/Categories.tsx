import { getPublicCategoriesWithProductCounts } from "@/lib/categories/public"
import { CategoriesClient } from "./CategoriesClient"

export default async function Categories() {
  const categories = await getPublicCategoriesWithProductCounts(8)
  return <CategoriesClient categories={categories} />
}
