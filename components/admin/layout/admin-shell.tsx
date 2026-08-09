"use client"

import * as React from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"
import type { Profile } from "@/types"

interface AdminShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export function AdminShell({ profile, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar
          profile={profile}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
