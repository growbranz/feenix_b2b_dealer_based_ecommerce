"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { NotificationCard } from "./notification-card"
import { NotificationFilters } from "./notification-filters"
import { useNotificationsRealtime } from "@/hooks/notifications/use-notifications-realtime"
import {
  getNotifications,
  markAsRead,
  markAllRead,
  archiveNotification,
  deleteNotification,
} from "@/lib/notifications/actions"
import { Bell } from "lucide-react"

interface NotificationCenterProps {
  userId: string
  mode?: "admin" | "dealer"
}

export function NotificationCenter({ userId, mode = "admin" }: NotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<any[]>([])
  const [activeTab, setActiveTab] = React.useState<"all" | "unread" | "read" | "archived">("all")
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  const filters = React.useMemo(() => {
    const base: any = { search, page, limit: 20 }
    if (activeTab === "unread") {
      base.isRead = false
      base.archived = false
    } else if (activeTab === "read") {
      base.isRead = true
      base.archived = false
    } else if (activeTab === "archived") {
      base.archived = true
    } else {
      base.archived = false
    }
    return base
  }, [activeTab, search, page])

  async function load() {
    setLoading(true)
    try {
      const result = await getNotifications(filters)
      if (page === 1) {
        setNotifications(result.data)
      } else {
        setNotifications((prev) => [...prev, ...result.data])
      }
      setTotalPages(result.totalPages)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      load()
    }, 300)
    return () => clearTimeout(timeout)
  }, [activeTab, search])

  React.useEffect(() => {
    load()
  }, [page])

  useNotificationsRealtime(userId, {
    onInsert: (n: any) => {
      setNotifications((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev
        return [n, ...prev]
      })
    },
    onUpdate: (n: any) => {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, ...n } : x)))
    },
    onDelete: (n: any) => {
      setNotifications((prev) => prev.filter((x) => x.id !== n.id))
    },
  })

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  async function handleArchive(id: string, archived: boolean) {
    await archiveNotification(id, archived)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleDelete(id: string) {
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleMarkAllRead() {
    await markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div className="space-y-4">
      <NotificationFilters
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setPage(1)
        }}
        search={search}
        onSearch={setSearch}
        onMarkAllRead={activeTab === "unread" ? handleMarkAllRead : undefined}
      />

      {loading && notifications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You don't have any notifications in this category."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={loading}>
                {loading ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
