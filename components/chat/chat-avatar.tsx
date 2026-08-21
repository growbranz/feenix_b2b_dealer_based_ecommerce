"use client"

interface ChatAvatarProps {
  name?: string | null
  url?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  isOnline?: boolean
}

const DIMENSIONS: Record<NonNullable<ChatAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-14 w-14 text-base",
}

const DOT_DIMENSIONS: Record<NonNullable<ChatAvatarProps["size"]>, string> = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
}

export function ChatAvatar({ name, url, size = "md", isOnline }: ChatAvatarProps) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div
      className={`relative inline-flex ${DIMENSIONS[size]} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-semibold text-blue-700 ring-2 ring-white`}
    >
      {url ? (
        <img src={url} alt={name || "User"} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${DOT_DIMENSIONS[size]} rounded-full border-2 border-white ${
            isOnline ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      )}
    </div>
  )
}
