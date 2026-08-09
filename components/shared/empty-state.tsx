import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm",
        className
      )}
    >
      {Icon && (
        <div className="mb-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 p-6">
          <Icon className="h-12 w-12 text-blue-600" />
        </div>
      )}
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-3 text-base text-slate-500 max-w-md">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}
