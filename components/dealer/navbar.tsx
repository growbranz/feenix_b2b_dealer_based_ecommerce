"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Menu, Search, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DealerBreadcrumb } from "./breadcrumb"
import { UserMenu } from "./user-menu"

interface DealerNavbarProps {
  onMenuClick: () => void
  className?: string
}

export function DealerNavbar({ onMenuClick, className }: DealerNavbarProps) {
  const pathname = usePathname()
  const [searchValue, setSearchValue] = React.useState("")

  // Clear search when route changes
  React.useEffect(() => {
    setSearchValue("")
  }, [pathname])

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
          className="md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <DealerBreadcrumb />
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="relative hidden w-full max-w-xs sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search products, orders..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-10 rounded-full border-slate-200 bg-slate-100/50 pl-9 pr-4 text-slate-600 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <UserMenu />
      </div>
    </header>
  )
}
