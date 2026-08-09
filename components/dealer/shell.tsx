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

  return (
    <DealerProvider profile={profile}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        <DealerSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DealerNavbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DealerProvider>
  )
}
