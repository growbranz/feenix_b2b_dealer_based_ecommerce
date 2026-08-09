"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, ChevronDown } from "lucide-react"
import { statusOptions, stateOptions, businessTypeOptions } from "./data"

interface DealerFiltersProps {
  search: string
  status: string
  state: string
  businessType: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onStateChange: (value: string) => void
  onBusinessTypeChange: (value: string) => void
  className?: string
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

export function DealerFilters({
  search,
  status,
  state,
  businessType,
  onSearchChange,
  onStatusChange,
  onStateChange,
  onBusinessTypeChange,
  className,
}: DealerFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center", className)}>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder="Search by business, owner, city..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 rounded-md border-slate-200 bg-white pl-9 text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:w-auto">
        <FilterSelect
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
        />
        <FilterSelect
          value={state}
          onChange={onStateChange}
          options={stateOptions}
        />
        <FilterSelect
          value={businessType}
          onChange={onBusinessTypeChange}
          options={businessTypeOptions}
        />
      </div>
    </div>
  )
}
