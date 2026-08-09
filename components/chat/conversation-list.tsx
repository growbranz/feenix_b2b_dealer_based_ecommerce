"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatAvatar } from "./chat-avatar"
import { Search, Pin, Archive, MoreVertical, MessageSquare } from "lucide-react"

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
}

function otherParticipantName(conversation: any, userId: string) {
  const others = conversation.participants?.filter((p: any) => p.user_id !== userId && p.user_id !== null)
  if (others?.length) return others[0]?.profile?.name || others[0]?.profile?.email || "Unknown"
  return conversation.title || "Chat"
}

function otherParticipant(conversation: any, userId: string) {
  return conversation.participants?.find((p: any) => p.user_id !== userId && p.user_id !== null)
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
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col border-r bg-slate-50/50 dark:bg-slate-900/50">
      <div className="border-b p-4">
        <h2 className="mb-3 text-lg font-semibold">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="mt-3 flex gap-2">
          {(["all", "pinned", "archived"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => onChangeTab?.(tab)}
            >
              {tab === "all" ? "All" : tab === "pinned" ? "Pinned" : "Archived"}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && conversations.length === 0 ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <MessageSquare className="mb-2 h-10 w-10 opacity-50" />
            <p>No conversations found.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c: any) => {
              const other = otherParticipant(c, currentUserId)
              const isOnline = onlineUserIds?.has(other?.user_id)
              const my = c.participants?.find((p: any) => p.user_id === currentUserId)
              const isPinned = !!my?.pinned_at
              const isArchived = !!my?.archived_at
              const isSelected = selectedId === c.id

              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      isSelected ? "bg-orange-50 text-orange-900 dark:bg-orange-900/20" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <ChatAvatar
                      name={other?.profile?.name}
                      url={other?.profile?.avatar_url}
                      size="md"
                      isOnline={isOnline}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">{otherParticipantName(c, currentUserId)}</span>
                        {my?.unread_count > 0 && (
                          <Badge className="ml-2 bg-orange-500 text-white">{my.unread_count}</Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {c.last_message_preview || "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-slate-400">
                        {c.last_message_at
                          ? new Date(c.last_message_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                          : ""}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPin(c.id, !isPinned)
                          }}
                          className={`rounded p-1 hover:bg-slate-200 ${isPinned ? "text-orange-500" : "text-slate-400"}`}
                          title={isPinned ? "Unpin" : "Pin"}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onArchive(c.id, !isArchived)
                          }}
                          className={`rounded p-1 hover:bg-slate-200 ${isArchived ? "text-orange-500" : "text-slate-400"}`}
                          title={isArchived ? "Unarchive" : "Archive"}
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
