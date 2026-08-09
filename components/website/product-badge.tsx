import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProductBadgeProps {
  children: React.ReactNode
  variant?: "new" | "used" | "refurbished" | "sale" | "featured"
  className?: string
}

export function ProductBadge({ children, variant = "new", className }: ProductBadgeProps) {
  const variantStyles = {
    new: "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100",
    used: "bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100",
    refurbished: "bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100",
    sale: "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100",
    featured: "bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100"
  }

  return (
    <Badge className={cn(variantStyles[variant], className)}>
      {children}
    </Badge>
  )
}
