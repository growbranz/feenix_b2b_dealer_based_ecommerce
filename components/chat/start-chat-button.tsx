"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatAvatar } from "./chat-avatar"
import { searchUsers, getOrCreateDirectConversation } from "@/lib/chat/actions"
import { MessageSquarePlus, X, Search } from "lucide-react"

interface StartChatButtonProps {
  mode: "admin" | "dealer"
  currentUserId: string
  defaultRole?: "ADMIN" | "DEALER"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function StartChatButton({ mode, currentUserId, defaultRole, open: controlledOpen, onOpenChange }: StartChatButtonProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value)
    if (controlledOpen === undefined) setInternalOpen(value)
  }
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const users = await searchUsers(query, defaultRole)
        setResults(users)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query, defaultRole])

  async function startChat(userId: string) {
    setOpen(false)
    try {
      const conversation = await getOrCreateDirectConversation(userId)
      router.push(`/${mode}/messages?conversation=${conversation.id}`)
      router.refresh()
    } catch (e: any) {
      alert(e.message || "Failed to start chat")
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="gap-1.5 rounded-full border-0 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35"
      >
        <MessageSquarePlus className="h-4 w-4" />
        New Chat
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Start Conversation</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded-lg pl-9"
                autoFocus
                aria-label="Search dealers by name or email"
              />
            </div>

            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <p className="py-4 text-center text-sm text-slate-500">Searching...</p>
              ) : results.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">
                  {query.length < 2 ? "Start typing to search users" : "No users found"}
                </p>
              ) : (
                <ul className="space-y-1">
                  {results.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => startChat(u.id)}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <ChatAvatar name={u.name} url={u.avatar_url} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-800 dark:text-slate-100">{u.name || "User"}</p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {u.role}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
