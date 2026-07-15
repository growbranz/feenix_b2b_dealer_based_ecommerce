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
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
        <CardContent className="p-4 flex-1">
          <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            {product.condition && (
              <div className="absolute top-2 left-2">
                <ProductBadge variant={product.condition.toLowerCase() as any}>
                  {product.condition}
                </ProductBadge>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{product.category.name}</p>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {product.title}
            </h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {product.brand.name} • {product.model.name}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">
              ${product.price.toLocaleString()}
            </p>
            {!isOutOfStock && (
              <p className="text-xs text-muted-foreground">
                {product.stock} in stock
              </p>
            )}
          </div>
          <Button size="sm" disabled={isOutOfStock}>
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
