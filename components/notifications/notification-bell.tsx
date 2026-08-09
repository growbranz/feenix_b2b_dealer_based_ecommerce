"use client"

import * as React from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { useNotificationsRealtime } from "@/hooks/notifications/use-notifications-realtime"

interface NotificationBellProps {
  userId: string
  href?: string
}

export function NotificationBell({ userId, href = "/admin/notifications" }: NotificationBellProps) {
  const { unreadCount } = useNotificationsRealtime(userId)

  return (
    <Link href={href} className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
      <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
