"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminBreadcrumb } from "./admin-breadcrumb"
import { AdminUserMenu } from "./admin-user-menu"
import type { Profile } from "@/types"
import { Menu, Search, Bell } from "lucide-react"

interface AdminNavbarProps {
  profile: Profile | null
  onMenuClick: () => void
  className?: string
}

export function AdminNavbar({
  profile,
  onMenuClick,
  className,
}: AdminNavbarProps) {
  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between gap-4 border-b border-slate-200 bg-white/70 px-4 backdrop-blur-xl md:px-6",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AdminBreadcrumb />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden w-full max-w-xs sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search dealers, products..."
            className="h-10 rounded-full border-slate-200 bg-slate-100/50 pl-9 pr-4 text-slate-600 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <AdminUserMenu profile={profile} />
      </div>
    </header>
  )
}
