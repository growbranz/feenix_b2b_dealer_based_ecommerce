"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, RefreshCw } from "lucide-react"

export interface AnalyticsFiltersState {
  from?: string
  to?: string
  dealerId?: string
  categoryId?: string
  brandId?: string
  city?: string
  paymentStatus?: string
  orderStatus?: string
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState
  onChange: (filters: AnalyticsFiltersState) => void
  onApply: () => void
  isAdmin?: boolean
}

export function AnalyticsFilters({ filters, onChange, onApply, isAdmin }: AnalyticsFiltersProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4" />
        Filters
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">From</label>
          <Input
            type="date"
            value={filters.from || ""}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">To</label>
          <Input
            type="date"
            value={filters.to || ""}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
          />
        </div>
        {isAdmin && (
          <div>
            <label className="mb-1 block text-xs text-slate-500">Dealer ID</label>
            <Input
              placeholder="Dealer ID"
              value={filters.dealerId || ""}
              onChange={(e) => onChange({ ...filters, dealerId: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs text-slate-500">Payment Status</label>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={filters.paymentStatus || ""}
            onChange={(e) => onChange({ ...filters, paymentStatus: e.target.value })}
          >
            <option value="">All</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Order Status</label>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={filters.orderStatus || ""}
            onChange={(e) => onChange({ ...filters, orderStatus: e.target.value })}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Category ID</label>
          <Input
            placeholder="Category"
            value={filters.categoryId || ""}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Brand ID</label>
          <Input
            placeholder="Brand"
            value={filters.brandId || ""}
            onChange={(e) => onChange({ ...filters, brandId: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onApply}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
