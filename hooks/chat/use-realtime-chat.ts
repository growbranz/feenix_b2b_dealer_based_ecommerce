"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { updatePresence } from "@/lib/chat/actions"

const supabase = createClient()

export function useHeartbeat(userId: string) {
  React.useEffect(() => {
    if (!userId) return

    const setOnline = () => updatePresence(true)
    setOnline()

    const interval = setInterval(setOnline, 30000)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setOnline()
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
      updatePresence(false)
    }
  }, [userId])
}

export function useMessagesRealtime(
  conversationId: string | null,
  handlers: {
    onInsert?: (message: any) => void
    onUpdate?: (message: any) => void
    onDelete?: (message: any) => void
  } = {}
) {
  React.useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") handlers.onInsert?.(payload.new)
          if (payload.eventType === "UPDATE") handlers.onUpdate?.(payload.new)
          if (payload.eventType === "DELETE") handlers.onDelete?.(payload.old)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])
}

export function useConversationsRealtime(
  userId: string | null,
  handlers: {
    onParticipantUpdate?: (participant: any) => void
    onParticipantInsert?: (participant: any) => void
  } = {}
) {
  React.useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") handlers.onParticipantInsert?.(payload.new)
          if (payload.eventType === "UPDATE") handlers.onParticipantUpdate?.(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
}

export function useTypingRealtime(
  conversationId: string | null,
  handlers: {
    onTyping?: (indicator: any) => void
    onStop?: (indicator: any) => void
  } = {}
) {
  React.useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_indicators",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          if (payload.eventType === "DELETE") {
            handlers.onStop?.(payload.old)
            return
          }
          const expires = payload.new?.expires_at
            ? new Date(payload.new.expires_at)
            : null
          if (expires && expires > new Date()) handlers.onTyping?.(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])
}

export function useUserPresence(
  userIds: string[],
  handlers: {
    onChange?: (presence: any) => void
  } = {}
) {
  React.useEffect(() => {
    if (userIds.length === 0) return
    const filter = userIds.map((id) => `user_id=eq.${id}`).join(", ")
    const channel = supabase
      .channel(`presence:${userIds.join(",")}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        (payload: any) => {
          if (userIds.includes(payload.new?.user_id ?? payload.old?.user_id)) {
            handlers.onChange?.(payload.new ?? payload.old)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userIds.join(",")])
}
