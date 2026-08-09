"use client"

import { User } from "lucide-react"

interface ChatAvatarProps {
  name?: string | null
  url?: string | null
  size?: "sm" | "md" | "lg"
  isOnline?: boolean
}

export function ChatAvatar({ name, url, size = "md", isOnline }: ChatAvatarProps) {
  const dimensions = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-14 w-14" : "h-10 w-10"
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className={`relative inline-flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600`}>
      {url ? (
        <img src={url} alt={name || "User"} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="text-xs font-semibold">{initials}</span>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
            isOnline ? "bg-emerald-500" : "bg-slate-400"
          }`}
        />
      )}
    </div>
  )
}
