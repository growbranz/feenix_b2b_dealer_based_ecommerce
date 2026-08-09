import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductBadge } from "@/components/website/product-badge"
import Link from "next/link"
import Image from "next/image"
import type { ProductWithDetails } from "@/types/website"

export interface ProductCardProps {
  product: ProductWithDetails
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const imageUrl = product.primary_image || product.images[0]?.image_url

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group cursor-pointer overflow-hidden h-full flex flex-col rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_24px_48px_-16px_rgba(37,99,235,0.13)] hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-5 flex-1">
          <div className="aspect-square bg-slate-50 rounded-2xl mb-5 overflow-hidden relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No Image
              </div>
            )}
            {product.condition && (
              <div className="absolute top-3 left-3">
                <ProductBadge variant={product.condition.toLowerCase() as any}>
                  {product.condition}
                </ProductBadge>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-sm px-3 py-1 rounded-full">Out of Stock</Badge>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{product.category.name}</p>
            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
            {product.description && (
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
            )}
            <p className="text-xs text-slate-400">
              {product.brand.name} • {product.model.name}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            {!isOutOfStock && (
              <p className="text-xs text-emerald-600 font-medium">
                {product.stock} in stock
              </p>
            )}
          </div>
          <Button size="sm" className="rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all border-0" disabled={isOutOfStock}>
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
