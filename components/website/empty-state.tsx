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
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title || content.title}</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {description || content.description}
      </p>
      {(actionLabel || content.actionLabel) && (
        <Link href={actionHref || content.actionHref!}>
          <Button>
            {actionLabel || content.actionLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}
