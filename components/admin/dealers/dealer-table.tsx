"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminDealer } from "./data"
import { businessTypeColors } from "./data"
import { DealerStatusBadge } from "./status-badge"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export type SortKey = "business_name" | "owner_name" | "business_type" | "city" | "state" | "status"
export type DealerAction = "view" | "edit" | "approve" | "reject" | "suspend" | "activate" | "delete"

interface DealerTableProps {
  dealers: AdminDealer[]
  sortKey: SortKey
  sortDirection: "asc" | "desc"
  onSort: (key: SortKey) => void
  onAction: (action: DealerAction, dealer: AdminDealer) => void
}

const columns: { key: SortKey; label: string; className?: string }[] = [
  { key: "business_name", label: "Business" },
  { key: "owner_name", label: "Owner" },
  { key: "business_type", label: "Type" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "status", label: "Status" },
]

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />
  return direction === "asc" ? (
    <ArrowUp className="ml-2 h-3.5 w-3.5 text-blue-600" />
  ) : (
    <ArrowDown className="ml-2 h-3.5 w-3.5 text-blue-600" />
  )
}

export function DealerTable({
  dealers,
  sortKey,
  sortDirection,
  onSort,
  onAction,
}: DealerTableProps) {
  if (dealers.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <p className="text-sm font-medium">No dealers found</p>
        <p className="text-xs">Try adjusting your filters or search</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                <button
                  onClick={() => onSort(column.key)}
                  className="flex items-center outline-none transition-colors hover:text-slate-700"
                >
                  {column.label}
                  <SortIcon active={sortKey === column.key} direction={sortDirection} />
                </button>
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {dealers.map((dealer) => (
            <tr
              key={dealer.id}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
            >
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {dealer.business_name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{dealer.owner_name}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    businessTypeColors[dealer.business_type]
                  )}
                >
                  {dealer.business_type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{dealer.city}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{dealer.state}</td>
              <td className="px-4 py-3">
                <DealerStatusBadge status={dealer.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onSelect={() => onAction("view", dealer)}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onAction("edit", dealer)}>
                      Edit
                    </DropdownMenuItem>
                    {dealer.status === "PENDING" && (
                      <>
                        <DropdownMenuItem onSelect={() => onAction("approve", dealer)}>
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onAction("reject", dealer)}>
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {dealer.status === "APPROVED" && (
                      <DropdownMenuItem onSelect={() => onAction("suspend", dealer)}>
                        Suspend
                      </DropdownMenuItem>
                    )}
                    {(dealer.status === "SUSPENDED" || dealer.status === "REJECTED") && (
                      <DropdownMenuItem onSelect={() => onAction("activate", dealer)}>
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onSelect={() => onAction("delete", dealer)} className="text-red-600 focus:text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
