import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col rounded-2xl border-slate-100 shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)]">
      <CardContent className="p-5 flex-1">
        <Skeleton className="aspect-square w-full rounded-2xl mb-5" />
        <Skeleton className="h-5 w-3/4 mb-3 rounded-md" />
        <Skeleton className="h-3.5 w-1/2 mb-3 rounded-md" />
        <Skeleton className="h-3.5 w-full mb-2 rounded-md" />
        <Skeleton className="h-3.5 w-2/3 rounded-md" />
      </CardContent>
      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </CardFooter>
    </Card>
  )
}

export function CategoryCardSkeleton() {
  return (
    <Card className="rounded-2xl border-slate-100 shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)]">
      <CardContent className="p-6">
        <Skeleton className="aspect-video w-full rounded-2xl mb-5" />
        <Skeleton className="h-6 w-3/4 mb-3 rounded-md" />
        <Skeleton className="h-4 w-1/2 mb-3 rounded-md" />
        <Skeleton className="h-4 w-1/3 rounded-md" />
      </CardContent>
    </Card>
  )
}

export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          
          <div className="space-y-4 pt-4 border-t">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-48" />
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}
