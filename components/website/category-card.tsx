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
      <Card className="group cursor-pointer overflow-hidden rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.08)] hover:shadow-[0_24px_48px_-16px_rgba(37,99,235,0.13)] hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          {category.image ? (
            <div className="aspect-video bg-slate-50 rounded-2xl mb-5 overflow-hidden relative">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : Icon && (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center mb-5 group-hover:from-blue-100 group-hover:to-blue-50 transition-all">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-slate-500 mb-2 leading-relaxed">{category.description}</p>
          )}
          <p className="text-xs font-medium text-slate-400">
            {category.product_count.toLocaleString()} products
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
