"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCheck, Inbox, Archive, MailOpen, Bell } from "lucide-react"

interface NotificationFiltersProps {
  activeTab: "all" | "unread" | "read" | "archived"
  onTabChange: (tab: "all" | "unread" | "read" | "archived") => void
  search: string
  onSearch: (q: string) => void
  onMarkAllRead?: () => void
}

export function NotificationFilters({ activeTab, onTabChange, search, onSearch, onMarkAllRead }: NotificationFiltersProps) {
  const tabs = [
    { key: "all", label: "All", icon: Inbox },
    { key: "unread", label: "Unread", icon: Bell },
    { key: "read", label: "Read", icon: MailOpen },
    { key: "archived", label: "Archived", icon: Archive },
  ] as const

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <Button
              key={t.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(t.key)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {t.label}
            </Button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {onMarkAllRead && (
          <Button variant="outline" size="sm" onClick={onMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>
    </div>
  )
}
