"use client"

import { cn } from "@/lib/utils"
import type { DealerStatus } from "./data"

const statusStyles: Record<DealerStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  APPROVED:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  REJECTED:
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  SUSPENDED:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
}

export function DealerStatusBadge({ status }: { status: DealerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusStyles[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  )
}
