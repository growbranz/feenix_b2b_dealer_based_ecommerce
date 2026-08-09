"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatAvatar } from "./chat-avatar"
import { MessageBubble } from "./message-bubble"
import { MessageComposer } from "./message-composer"
import { MoreVertical, Phone, AlertTriangle } from "lucide-react"

interface ChatWindowProps {
  conversation: any
  messages: any[]
  currentUserId: string
  typingUsers: any[]
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onSend: (text: string) => void
  onUpload: (file: File) => Promise<void>
  onTyping: () => void
  onReport?: () => void
  onlineUserIds?: Set<string>
  presence?: Record<string, { is_online?: boolean; last_seen_at?: string }>
}

function formatDateSeparator(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: today.getFullYear() !== d.getFullYear() ? "numeric" : undefined })
}

function formatLastSeen(iso?: string | null) {
  if (!iso) return "last seen a while ago"
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return "online"
  if (diff < 3600000) return `last seen ${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `last seen ${Math.floor(diff / 3600000)}h ago`
  return `last seen ${d.toLocaleDateString("en-IN")}`
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  typingUsers,
  loading,
  hasMore,
  onLoadMore,
  onSend,
  onUpload,
  onTyping,
  onReport,
  onlineUserIds,
  presence,
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const shouldScroll = React.useRef(true)
  const [isUploading, setIsUploading] = React.useState(false)

  const otherParticipant = conversation?.participants?.find(
    (p: any) => p.user_id !== currentUserId && p.user_id !== null
  )
  const otherName = otherParticipant?.profile?.name || otherParticipant?.profile?.email || "Chat"
  const otherId = otherParticipant?.user_id
  const isOnline = otherId ? onlineUserIds?.has(otherId) || !!presence?.[otherId]?.is_online : false
  const lastSeen = otherId ? presence?.[otherId]?.last_seen_at : undefined

  const handleSend = (text: string) => {
    shouldScroll.current = true
    onSend(text)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await onUpload(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    shouldScroll.current = isBottom
    if (el.scrollTop === 0 && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }

  React.useEffect(() => {
    if (shouldScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typingUsers])

  React.useEffect(() => {
    shouldScroll.current = true
  }, [conversation?.id])

  const grouped: { date: string; items: any[] }[] = []
  messages.forEach((m) => {
    const key = new Date(m.created_at).toDateString()
    if (grouped.length === 0 || grouped[grouped.length - 1].date !== key) {
      grouped.push({ date: m.created_at, items: [] })
    }
    grouped[grouped.length - 1].items.push(m)
  })

  return (
    <div className="flex h-full flex-col bg-slate-50/30 dark:bg-slate-900/30">
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <ChatAvatar
            name={otherParticipant?.profile?.name}
            url={otherParticipant?.profile?.avatar_url}
            size="md"
            isOnline={isOnline}
          />
          <div>
            <h3 className="font-semibold">{otherName}</h3>
            <p className="text-xs text-slate-500">
              {isOnline ? "online" : formatLastSeen(lastSeen)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conversation?.context_type && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800">
              {conversation.context_type}
            </span>
          )}
          {onReport && (
            <Button variant="ghost" size="icon" onClick={onReport} title="Report conversation">
              <AlertTriangle className="h-4 w-4 text-slate-500" />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {loading && messages.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-2/3" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {hasMore && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load older messages"}
                </Button>
              </div>
            )}
            {grouped.map((g) => (
              <div key={g.date} className="space-y-3">
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800">
                    {formatDateSeparator(g.date)}
                  </span>
                </div>
                {g.items.map((m) => (
                  <MessageBubble
                    key={m.id || m.tempId}
                    message={m}
                    currentUserId={currentUserId}
                    showAvatar={!m.is_me}
                  />
                ))}
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ChatAvatar name={typingUsers[0]?.profile?.name} size="sm" />
                <span className="animate-pulse">{typingUsers[0]?.profile?.name || "Someone"} is typing…</span>
              </div>
            )}
          </div>
        )}
      </div>

      <MessageComposer
        onSend={handleSend}
        onTyping={onTyping}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  )
}
