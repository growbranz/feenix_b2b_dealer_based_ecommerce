"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from "@/lib/auth/auth.service"
import type { Profile } from "@/types"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"

interface AdminUserMenuProps {
  profile: Profile | null
  className?: string
}

export function AdminUserMenu({ profile, className }: AdminUserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await authService.logout()
    router.push("/auth/login")
  }

  const displayName = profile?.name || profile?.business_name || "Admin User"
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex h-10 items-center gap-2 rounded-full px-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
            className
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white shadow-md">
            {initials || <User className="h-4 w-4" />}
          </span>
          <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline">
            {displayName}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:inline" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-slate-500">
              {profile?.email || "admin@feenix.com"}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              {profile?.role || "ADMIN"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
