"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Archive, Trash2, AlertTriangle, AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

interface NotificationCardProps {
  notification: any
  onMarkRead?: (id: string) => void
  onArchive?: (id: string, archived: boolean) => void
  onDelete?: (id: string) => void
}

const typeIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  error: <XCircle className="h-5 w-5 text-rose-500" />,
  critical: <AlertCircle className="h-5 w-5 text-red-600" />,
  information: <Info className="h-5 w-5 text-blue-500" />,
}

export function NotificationCard({ notification, onMarkRead, onArchive, onDelete }: NotificationCardProps) {
  const type = notification.type || "information"
  const isRead = notification.is_read
  const isArchived = !!notification.archived_at

  const content = (
    <div
      className={cn(
        "group relative flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900",
        isRead ? "opacity-80" : "border-l-4 border-l-orange-500",
        isArchived && "bg-slate-50 dark:bg-slate-900/50"
      )}
    >
      <div className="mt-1 shrink-0">{typeIcons[type] || <Bell className="h-5 w-5 text-slate-400" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={cn("text-sm font-medium", !isRead && "font-semibold")}>{notification.title}</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
          </div>
          {!isRead && (
            <Badge variant="default" className="h-2 w-2 rounded-full bg-orange-500 p-0" />
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{new Date(notification.created_at).toLocaleString("en-IN")}</span>
            {notification.category && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800">{notification.category}</span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
            {!isRead && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMarkRead?.(notification.id)} title="Mark as read">
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onArchive?.(notification.id, !isArchived)}
              title={isArchived ? "Unarchive" : "Archive"}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete?.(notification.id)} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block" onClick={() => !isRead && onMarkRead?.(notification.id)}>
        {content}
      </Link>
    )
  }

  return <div>{content}</div>
}
