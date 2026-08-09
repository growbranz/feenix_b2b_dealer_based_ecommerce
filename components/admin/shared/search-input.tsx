"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          ref={ref}
          type="search"
          placeholder="Search..."
          className={cn("h-10 rounded-md border-slate-200 bg-white pl-9 text-sm", className)}
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"
