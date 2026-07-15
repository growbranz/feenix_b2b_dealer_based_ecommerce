import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { CategoryWithCount } from "@/types/website"

export interface CategoryCardProps {
  category: CategoryWithCount
  icon?: LucideIcon
}

export function CategoryCard({ category, icon: Icon }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
        <CardContent className="p-6">
          {category.image ? (
            <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden relative">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : Icon && (
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          )}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {category.product_count.toLocaleString()} products
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
