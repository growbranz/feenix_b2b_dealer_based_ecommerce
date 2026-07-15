import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ProductBadgeProps {
  children: React.ReactNode
  variant?: "new" | "used" | "refurbished" | "sale" | "featured"
  className?: string
}

export function ProductBadge({ children, variant = "new", className }: ProductBadgeProps) {
  const variantStyles = {
    new: "bg-green-500 text-white hover:bg-green-600",
    used: "bg-orange-500 text-white hover:bg-orange-600",
    refurbished: "bg-blue-500 text-white hover:bg-blue-600",
    sale: "bg-red-500 text-white hover:bg-red-600",
    featured: "bg-purple-500 text-white hover:bg-purple-600"
  }

  return (
    <Badge className={cn(variantStyles[variant], className)}>
      {children}
    </Badge>
  )
}
