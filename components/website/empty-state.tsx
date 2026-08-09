import { Button } from "@/components/ui/button"
import { Package, Search, FileQuestion } from "lucide-react"
import Link from "next/link"

export interface EmptyStateProps {
  type?: 'products' | 'search' | 'categories' | 'general'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  type = 'general',
  title,
  description,
  actionLabel,
  actionHref,
  className
}: EmptyStateProps) {
  const defaultContent = {
    products: {
      icon: Package,
      title: 'No Products Found',
      description: 'We couldn\'t find any products matching your criteria. Try adjusting your filters or browse our categories.',
      actionLabel: 'Browse Categories',
      actionHref: '/categories'
    },
    search: {
      icon: Search,
      title: 'No Results Found',
      description: 'We couldn\'t find any results for your search. Try different keywords or browse our categories.',
      actionLabel: 'Clear Search',
      actionHref: '/products'
    },
    categories: {
      icon: FileQuestion,
      title: 'No Categories Found',
      description: 'We couldn\'t find any categories at the moment. Please check back later.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    },
    general: {
      icon: Package,
      title: 'Nothing Here',
      description: 'There\'s nothing to show right now. Please check back later.',
      actionLabel: 'Go to Home',
      actionHref: '/'
    }
  }

  const content = defaultContent[type]
  const Icon = content.icon

  return (
    <div className={`flex flex-col items-center justify-center py-20 px-4 ${className}`}>
      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Icon className="h-10 w-10 text-blue-500" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{title || content.title}</h2>
      <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
        {description || content.description}
      </p>
      {(actionLabel || content.actionLabel) && (
        <Link href={actionHref || content.actionHref!}>
          <Button className="rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all">
            {actionLabel || content.actionLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}
