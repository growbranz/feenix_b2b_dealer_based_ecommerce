"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { getUnreadCount } from "@/lib/notifications/actions"

const supabase = createClient()

interface UseNotificationsRealtimeOptions {
  onInsert?: (notification: any) => void
  onUpdate?: (notification: any) => void
  onDelete?: (notification: any) => void
}

export function useNotificationsRealtime(userId: string | null | undefined, options: UseNotificationsRealtimeOptions = {}) {
  const [unreadCount, setUnreadCount] = React.useState(0)

  const refreshCount = React.useCallback(async () => {
    if (!userId) return
    try {
      const count = await getUnreadCount(userId)
      setUnreadCount(count)
    } catch (e) {
      console.warn("Failed to fetch unread count", e)
    }
  }, [userId])

  React.useEffect(() => {
    if (!userId) return
    refreshCount()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          refreshCount()
          if (payload.eventType === "INSERT") options.onInsert?.(payload.new)
          if (payload.eventType === "UPDATE") options.onUpdate?.(payload.new)
          if (payload.eventType === "DELETE") options.onDelete?.(payload.old)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { unreadCount, refreshCount }
}
