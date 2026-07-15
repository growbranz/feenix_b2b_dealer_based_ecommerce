import * as React from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Header } from "@/components/shared/header"

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumb?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <Header title={title} description={description} actions={actions} />
    </div>
  )
}
