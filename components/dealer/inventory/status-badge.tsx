"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle2, Clock, Archive, XCircle, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StockStatus, ProductStatus } from "./types"

const stockStatusConfig: Record<StockStatus, { label: string; color: string; icon: any }> = {
  in_stock: {
    label: "In Stock",
    color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
    icon: CheckCircle2,
  },
  low_stock: {
    label: "Low Stock",
    color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
    icon: AlertTriangle,
  },
  out_of_stock: {
    label: "Out of Stock",
    color: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20",
    icon: XCircle,
  },
  pre_order: {
    label: "Pre Order",
    color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    icon: Clock,
  },
}

const productStatusConfig: Record<ProductStatus, { label: string; color: string; icon: any }> = {
  draft: {
    label: "Draft",
    color: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20",
    icon: Package,
  },
  pending_approval: {
    label: "Pending Approval",
    color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
    icon: Clock,
  },
  published: {
    label: "Published",
    color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
    icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    color: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20",
    icon: Archive,
  },
  out_of_stock: {
    label: "Out of Stock",
    color: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20",
    icon: XCircle,
  },
  archived: {
    label: "Archived",
    color: "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20",
    icon: Archive,
  },
}

interface StockStatusBadgeProps {
  status: StockStatus
  showIcon?: boolean
}

export function StockStatusBadge({ status, showIcon = true }: StockStatusBadgeProps) {
  const config = stockStatusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border-0 px-2.5 py-0.5 text-xs font-medium", config.color)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

interface ProductStatusBadgeProps {
  status: ProductStatus
  showIcon?: boolean
}

export function ProductStatusBadge({ status, showIcon = true }: ProductStatusBadgeProps) {
  const config = productStatusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border-0 px-2.5 py-0.5 text-xs font-medium", config.color)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
