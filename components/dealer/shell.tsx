"use client"

import * as React from "react"
import type { Profile } from "@/types"
import { DealerProvider } from "./dealer-provider"
import { DealerSidebar } from "./sidebar"
import { DealerNavbar } from "./navbar"

interface DealerShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export function DealerShell({ profile, children }: DealerShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Persist collapse state in local storage
  React.useEffect(() => {
    const saved = localStorage.getItem("dealer-sidebar-collapsed")
    if (saved !== null) {
      setCollapsed(saved === "true")
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem("dealer-sidebar-collapsed", String(collapsed))
  }, [collapsed])

  return (
    <DealerProvider profile={profile}>
      <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
        <DealerSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DealerNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 min-w-0 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DealerProvider>
  )
}
