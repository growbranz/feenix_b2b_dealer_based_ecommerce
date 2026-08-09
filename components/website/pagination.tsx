"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  showEdges?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  showEdges = true,
  className
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/products?${params.toString()}`)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    if (showEdges) {
      pages.push(1)
    }

    if (currentPage > 3) {
      pages.push("...")
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push("...")
    }

    if (showEdges) {
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} role="navigation" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10 border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => (
        <React.Fragment key={index}>
          {typeof page === "number" ? (
            <Button
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              className={`h-10 w-10 rounded-full border-slate-200 transition-all ${page === currentPage ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white border-0 shadow-md shadow-blue-500/20" : "hover:border-blue-200 hover:bg-blue-50/50"}`}
              onClick={() => handlePageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          ) : (
            <span className="px-2 text-slate-400" aria-hidden="true">...</span>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10 border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
