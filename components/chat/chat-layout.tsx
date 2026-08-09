"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useHeartbeat, useConversationsRealtime, useMessagesRealtime, useTypingRealtime, useUserPresence } from "@/hooks/chat/use-realtime-chat"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { StartChatButton } from "./start-chat-button"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getConversations,
  getMessages,
  getConversationById,
  sendMessage,
  uploadAttachment,
  markConversationRead,
  pinConversation,
  archiveConversation,
  setTyping,
  getParticipantsPresence,
  getTypingIndicators,
  reportConversation,
} from "@/lib/chat/actions"

interface ChatLayoutProps {
  currentUser: { id: string; name?: string | null; avatar_url?: string | null; role?: string }
  mode: "admin" | "dealer"
  defaultSearchRole?: "ADMIN" | "DEALER"
}

export function ChatLayout({ currentUser, mode, defaultSearchRole }: ChatLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramConv = searchParams.get("conversation")

  const [conversations, setConversations] = React.useState<any[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(paramConv)
  const [messages, setMessages] = React.useState<any[]>([])
  const [typingUsers, setTypingUsers] = React.useState<any[]>([])
  const [presence, setPresence] = React.useState<Record<string, any>>({})
  const [onlineUserIds, setOnlineUserIds] = React.useState<Set<string>>(new Set())
  const [loadingConv, setLoadingConv] = React.useState(true)
  const [loadingMsg, setLoadingMsg] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"all" | "pinned" | "archived">("all")
  const [search, setSearch] = React.useState("")
  const [hasMore, setHasMore] = React.useState(true)

  const typingTimeouts = React.useRef<Record<string, NodeJS.Timeout>>({})
  const latestSearch = React.useRef(search)
  const latestTab = React.useRef(activeTab)

  React.useEffect(() => {
    latestSearch.current = search
    latestTab.current = activeTab
  }, [search, activeTab])

  async function loadConversations() {
    setLoadingConv(true)
    try {
      const filters: any = { search: latestSearch.current }
      if (activeTab === "pinned") {
        filters.pinned = true
        filters.archived = false
      } else if (activeTab === "archived") {
        filters.archived = true
      } else {
        filters.archived = false
      }
      const data = await getConversations(filters)
      setConversations(data || [])
      gatherPresence(data || [])
    } finally {
      setLoadingConv(false)
    }
  }

  async function gatherPresence(data: any[]) {
    const userIds = new Set<string>()
    for (const c of data) {
      for (const p of c.participants || []) {
        if (p.user_id && p.user_id !== currentUser.id) userIds.add(p.user_id)
      }
    }
    if (userIds.size === 0) return
    const presences = await getParticipantsPresence(Array.from(userIds))
    const map: Record<string, any> = {}
    for (const p of presences) {
      map[p.user_id] = p
    }
    setPresence(map)
    setOnlineUserIds(new Set(Array.from(userIds).filter((id) => map[id]?.is_online)))
  }

  async function loadMessages(conversationId: string, before?: string) {
    setLoadingMsg(true)
    try {
      const data = await getMessages(conversationId, { limit: 40, before })
      if (before) {
        setMessages((prev) => [...data, ...prev])
        setHasMore(data.length >= 40)
      } else {
        setMessages(data)
        setHasMore(data.length >= 40)
      }
    } finally {
      setLoadingMsg(false)
    }
  }

  async function handleSelect(id: string) {
    setSelectedId(id)
    router.replace(`/${mode}/messages?conversation=${id}`)
    setTypingUsers([])
    await loadMessages(id)
    try {
      await markConversationRead(id)
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, my_unread: 0, participants: c.participants?.map((p: any) => (p.user_id === currentUser.id ? { ...p, unread_count: 0 } : p)) }
            : c
        )
      )
    } catch (e) {
      console.warn("Failed to mark read", e)
    }
  }

  async function handleSend(text: string) {
    if (!selectedId) return
    const sent = await sendMessage(selectedId, { content: text, messageType: "text" })
    setMessages((prev) => [...prev, { ...sent, is_me: true, status: "sent", sender: { id: currentUser.id, name: currentUser.name } }])
  }

  async function handleUpload(file: File) {
    if (!selectedId) return
    const formData = new FormData()
    formData.append("file", file)
    const attachment = await uploadAttachment(formData)
    const isImage = file.type.startsWith("image/")
    const type = isImage ? "image" : "pdf"
    const sent = await sendMessage(selectedId, {
      content: file.name,
      messageType: type,
      metadata: {
        path: attachment.path,
        publicUrl: attachment.publicUrl,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
      },
    })
    setMessages((prev) => [...prev, { ...sent, is_me: true, status: "sent", sender: { id: currentUser.id, name: currentUser.name } }])
  }

  const typingDebounce = React.useRef<NodeJS.Timeout | null>(null)
  function handleTyping() {
    if (!selectedId) return
    if (typingDebounce.current) clearTimeout(typingDebounce.current)
    setTyping(selectedId)
    typingDebounce.current = setTimeout(() => {
      setTyping(selectedId)
    }, 2000)
  }

  async function handlePin(id: string, pinned: boolean) {
    await pinConversation(id, pinned)
    loadConversations()
  }

  async function handleArchive(id: string, archived: boolean) {
    await archiveConversation(id, archived)
    if (archived && selectedId === id) {
      setSelectedId(null)
      router.replace(`/${mode}/messages`)
    }
    loadConversations()
  }

  async function handleLoadMore() {
    if (!selectedId || messages.length === 0) return
    const before = messages[0]?.created_at
    await loadMessages(selectedId, before)
  }

  async function handleReport() {
    if (!selectedId) return
    const reason = window.prompt("Reason for reporting this conversation?")
    if (!reason) return
    await reportConversation(selectedId, reason)
    alert("Conversation reported")
  }

  const typingCacheRef = React.useRef<Record<string, NodeJS.Timeout>>({})
  function addTypingUser(u: any) {
    setTypingUsers((prev) => {
      if (prev.some((x) => x.user_id === u.user_id)) return prev
      return [...prev, u]
    })
    if (typingCacheRef.current[u.user_id]) clearTimeout(typingCacheRef.current[u.user_id])
    typingCacheRef.current[u.user_id] = setTimeout(() => {
      setTypingUsers((prev) => prev.filter((x) => x.user_id !== u.user_id))
    }, 9000)
  }

  function removeTypingUser(u: any) {
    setTypingUsers((prev) => prev.filter((x) => x.user_id !== u.user_id))
    if (typingCacheRef.current[u.user_id]) clearTimeout(typingCacheRef.current[u.user_id])
  }

  useHeartbeat(currentUser.id)

  useConversationsRealtime(currentUser.id, {
    onParticipantInsert: () => loadConversations(),
    onParticipantUpdate: () => loadConversations(),
  })

  useMessagesRealtime(selectedId, {
    onInsert: (m: any) => {
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev
        return [...prev, { ...m, is_me: m.sender_id === currentUser.id }]
      })
      if (m.sender_id !== currentUser.id && m.conversation_id === selectedId) {
        markConversationRead(m.conversation_id)
      }
    },
    onUpdate: (m: any) => {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...m } : x)))
    },
    onDelete: (m: any) => {
      setMessages((prev) => prev.filter((x) => x.id !== m.id))
    },
  })

  useTypingRealtime(selectedId, {
    onTyping: (u: any) => {
      if (u.user_id !== currentUser.id) addTypingUser(u)
    },
    onStop: (u: any) => removeTypingUser(u),
  })

  const otherUserIds = React.useMemo(() => {
    const ids = new Set<string>()
    for (const c of conversations) {
      for (const p of c.participants || []) {
        if (p.user_id && p.user_id !== currentUser.id) ids.add(p.user_id)
      }
    }
    if (selectedConversation) {
      for (const p of selectedConversation.participants || []) {
        if (p.user_id && p.user_id !== currentUser.id) ids.add(p.user_id)
      }
    }
    return Array.from(ids)
  }, [conversations, selectedId])

  useUserPresence(otherUserIds, {
    onChange: (p: any) => {
      setPresence((prev) => ({ ...prev, [p.user_id]: p }))
      setOnlineUserIds((prev) => {
        const next = new Set(prev)
        if (p.is_online) next.add(p.user_id)
        else next.delete(p.user_id)
        return next
      })
    },
  })

  React.useEffect(() => {
    loadConversations()
  }, [])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      loadConversations()
    }, 300)
    return () => clearTimeout(timeout)
  }, [search, activeTab])

  React.useEffect(() => {
    if (paramConv && paramConv !== selectedId) {
      setSelectedId(paramConv)
      loadMessages(paramConv)
      try {
        markConversationRead(paramConv)
      } catch {}
    }
  }, [paramConv])

  const selectedConversation = React.useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">Messaging</h2>
          <p className="text-xs text-slate-500">Real-time conversations</p>
        </div>
        <StartChatButton mode={mode} currentUserId={currentUser.id} defaultRole={defaultSearchRole} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full sm:w-80 lg:w-96 border-r">
          <ConversationList
            currentUserId={currentUser.id}
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
            onPin={handlePin}
            onArchive={handleArchive}
            onSearch={setSearch}
            loading={loadingConv}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onlineUserIds={onlineUserIds}
          />
        </div>
        <div className="hidden flex-1 sm:block">
          {selectedId && selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              currentUserId={currentUser.id}
              typingUsers={typingUsers}
              loading={loadingMsg}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onSend={handleSend}
              onUpload={handleUpload}
              onTyping={handleTyping}
              onReport={handleReport}
              onlineUserIds={onlineUserIds}
              presence={presence}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
