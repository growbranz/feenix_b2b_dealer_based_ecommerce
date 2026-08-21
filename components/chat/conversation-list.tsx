"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatAvatar } from "./chat-avatar"
import { Search, Pin, Archive, Inbox, MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationListProps {
  currentUserId: string
  conversations: any[]
  selectedId?: string | null
  onSelect: (id: string) => void
  onPin: (id: string, pinned: boolean) => void
  onArchive: (id: string, archived: boolean) => void
  onSearch: (q: string) => void
  loading?: boolean
  activeTab?: "all" | "pinned" | "archived"
  onChangeTab?: (tab: "all" | "pinned" | "archived") => void
  onlineUserIds?: Set<string>
  onStartNewChat?: () => void
}

const TABS: { key: "all" | "pinned" | "archived"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pinned", label: "Pinned" },
  { key: "archived", label: "Archived" },
]

function otherParticipantName(conversation: any, userId: string) {
  const others = conversation.participants?.filter((p: any) => p.user_id !== userId && p.user_id !== null)
  if (others?.length) return others[0]?.profile?.name || others[0]?.profile?.email || "Unknown"
  return conversation.title || "Chat"
}

function otherParticipant(conversation: any, userId: string) {
  return conversation.participants?.find((p: any) => p.user_id !== userId && p.user_id !== null)
}

function formatTimestamp(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

export function ConversationList({
  currentUserId,
  conversations,
  selectedId,
  onSelect,
  onPin,
  onArchive,
  onSearch,
  loading,
  activeTab = "all",
  onChangeTab,
  onlineUserIds,
  onStartNewChat,
}: ConversationListProps) {
  const totalUnread = conversations.reduce((sum, c) => {
    const my = c.participants?.find((p: any) => p.user_id === currentUserId)
    return sum + (my?.unread_count || 0)
  }, 0)

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="border-b border-slate-100 px-4 pb-3 pt-4 dark:border-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversations</h2>
          {totalUnread > 0 && (
            <Badge className="h-[18px] min-w-[18px] justify-center rounded-full border-0 bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
              {totalUnread}
            </Badge>
          )}
        </div>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:bg-white dark:border-slate-700 dark:bg-slate-800"
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChangeTab?.(tab.key)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-white text-blue-700 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="space-y-3 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-1">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-blue-50 p-4 dark:bg-blue-950/40">
              <Inbox className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {activeTab === "all" ? "No conversations yet" : `No ${activeTab} conversations`}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {activeTab === "all"
                  ? "Start a conversation with another dealer."
                  : "Nothing to show here right now."}
              </p>
            </div>
            {activeTab === "all" && onStartNewChat && (
              <Button
                size="sm"
                onClick={onStartNewChat}
                className="mt-1 gap-1.5 rounded-full border-0 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35"
              >
                <MessageSquarePlus className="h-4 w-4" />
                New Chat
              </Button>
            )}
          </div>
        ) : (
          <ul className="space-y-0.5 p-2">
            {conversations.map((c: any) => {
              const other = otherParticipant(c, currentUserId)
              const isOnline = onlineUserIds?.has(other?.user_id)
              const my = c.participants?.find((p: any) => p.user_id === currentUserId)
              const isPinned = !!my?.pinned_at
              const isArchived = !!my?.archived_at
              const isSelected = selectedId === c.id
              const unread = my?.unread_count || 0

              return (
                <li key={c.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelect(c.id)
                      }
                    }}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50/60 ring-1 ring-inset ring-blue-100 dark:from-blue-950/40 dark:to-indigo-950/20 dark:ring-blue-900"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <ChatAvatar
                      name={other?.profile?.name}
                      url={other?.profile?.avatar_url}
                      size="md"
                      isOnline={isOnline}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unread > 0 ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-200"
                          )}
                        >
                          {otherParticipantName(c, currentUserId)}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-400">{formatTimestamp(c.last_message_at)}</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className={cn("truncate text-xs", unread > 0 ? "text-slate-600 dark:text-slate-300" : "text-slate-400")}>
                          {c.last_message_preview || "No messages yet"}
                        </p>
                        {unread > 0 && (
                          <Badge className="h-[18px] min-w-[18px] shrink-0 justify-center rounded-full border-0 bg-blue-600 px-1 text-[10px] font-semibold text-white">
                            {unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="ml-1 flex shrink-0 flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPin(c.id, !isPinned)
                        }}
                        className={cn(
                          "rounded p-1 hover:bg-slate-200/70 dark:hover:bg-slate-700",
                          isPinned ? "text-blue-600" : "text-slate-300 dark:text-slate-600"
                        )}
                        title={isPinned ? "Unpin" : "Pin"}
                        aria-label={isPinned ? "Unpin conversation" : "Pin conversation"}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onArchive(c.id, !isArchived)
                        }}
                        className={cn(
                          "rounded p-1 hover:bg-slate-200/70 dark:hover:bg-slate-700",
                          isArchived ? "text-blue-600" : "text-slate-300 dark:text-slate-600"
                        )}
                        title={isArchived ? "Unarchive" : "Archive"}
                        aria-label={isArchived ? "Unarchive conversation" : "Archive conversation"}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
