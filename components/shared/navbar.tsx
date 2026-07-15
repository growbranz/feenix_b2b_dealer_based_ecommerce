"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import { Bell, Search, User } from "lucide-react"

export interface NavbarProps {
  title?: string
  showSearch?: boolean
  showNotifications?: boolean
  showProfile?: boolean
  showThemeToggle?: boolean
  onSearch?: (value: string) => void
  className?: string
}

export function Navbar({
  title,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  showThemeToggle = true,
  onSearch,
  className
}: NavbarProps) {
  const [searchValue, setSearchValue] = React.useState("")

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between border-b bg-card px-4",
        className
      )}
    >
      {title && <h1 className="text-xl font-semibold">{title}</h1>}

      <div className="flex flex-1 items-center justify-end gap-2">
        {showSearch && (
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}

        {showThemeToggle && <ThemeSwitch />}

        {showNotifications && (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-destructive" />
          </Button>
        )}

        {showProfile && (
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
