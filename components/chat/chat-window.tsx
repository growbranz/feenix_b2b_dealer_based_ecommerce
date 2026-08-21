"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatAvatar } from "./chat-avatar"
import { MessageBubble } from "./message-bubble"
import { MessageComposer } from "./message-composer"
import { MoreVertical, ArrowLeft, Flag, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

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
  onBack?: () => void
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
  onBack,
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
    <div className="flex h-full flex-col bg-slate-50/40 dark:bg-slate-900/30">
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="-ml-1 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <ChatAvatar
            name={otherParticipant?.profile?.name}
            url={otherParticipant?.profile?.avatar_url}
            size="lg"
            isOnline={isOnline}
          />
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">{otherName}</h3>
            <p className={cn("text-xs", isOnline ? "font-medium text-emerald-600" : "text-slate-400")}>
              {isOnline ? "Online" : formatLastSeen(lastSeen)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {conversation?.context_type && (
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
            >
              {conversation.context_type}
            </Badge>
          )}
          {onReport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Conversation options">
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onReport} className="gap-2 text-rose-600 focus:text-rose-700">
                  <Flag className="h-4 w-4" />
                  Report conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {loading && messages.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={cn("h-12 w-2/3 rounded-2xl", i % 2 === 0 ? "" : "ml-auto")} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
            <MessageCircle className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {hasMore && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load older messages"}
                </Button>
              </div>
            )}
            {grouped.map((g) => (
              <div key={g.date} className="space-y-1">
                <div className="mb-3 flex justify-center">
                  <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800">
                    {formatDateSeparator(g.date)}
                  </span>
                </div>
                {g.items.map((m, idx) => {
                  const prev = g.items[idx - 1]
                  const next = g.items[idx + 1]
                  const isGroupStart = !prev || prev.sender_id !== m.sender_id
                  const isGroupEnd = !next || next.sender_id !== m.sender_id
                  return (
                    <MessageBubble
                      key={m.id || m.tempId}
                      message={m}
                      currentUserId={currentUserId}
                      showAvatar={!m.is_me && isGroupEnd}
                      className={isGroupStart ? "mt-3" : "mt-0.5"}
                    />
                  )
                })}
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
