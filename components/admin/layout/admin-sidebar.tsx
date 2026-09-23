"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth/auth.service"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Folder,
  Tag,
  Package,
  Box,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
  MessageSquare,
  ShoppingCart,
  Warehouse,
  CreditCard,
  Image,
  User,
  BarChart3,
  Quote,
} from "lucide-react"

export interface AdminNavItem {
  title: string
  href?: string
  icon: LucideIcon
  badge?: number
  comingSoon?: boolean
  group?: string
}

const navItems: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, group: "main" },
  { title: "Dealers", href: "/admin/dealers", icon: Users, group: "main" },
  { title: "Enquiries", href: "/admin/enquiries", icon: MessageSquare, group: "main" },
  { title: "Categories", href: "/admin/categories", icon: Folder, group: "catalog" },
  { title: "Brands", href: "/admin/brands", icon: Tag, group: "catalog" },
  { title: "Models", href: "/admin/models", icon: Box, group: "catalog" },
  { title: "Products", href: "/admin/products", icon: Package, group: "catalog" },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart, group: "commerce" },
  { title: "Payments", href: "/admin/payments", icon: CreditCard, group: "commerce" },
  { title: "Inventory", href: "/admin/inventory", icon: Warehouse, group: "commerce" },
  { title: "Banners", href: "/admin/banners", icon: Image, group: "website" },
  { title: "Marketplace Stats", href: "/admin/marketplace-stats", icon: BarChart3, group: "website" },
  { title: "Testimonials", href: "/admin/testimonials", icon: Quote, group: "website" },
  { title: "Activity", href: "/admin/activity", icon: Activity, group: "system" },
  { title: "Settings", href: "/admin/settings", icon: Settings, group: "system" },
]

const groupLabels: Record<string, string> = {
  main: "",
  catalog: "Catalog",
  commerce: "Commerce",
  website: "Website",
  system: "System",
}

export interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authService.logout()
    router.push("/auth/login")
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === "/admin") return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-dvh flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Fixed Header */}
      <div className={cn(
        "flex shrink-0 items-center border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm",
        collapsed ? "h-16 justify-center px-3" : "h-16 justify-between px-5"
      )}>
        <Link href="/admin" className="flex items-center transition-opacity hover:opacity-80">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 shadow-lg shadow-blue-500/20">
            <img 
              src="/images/feenix-repair-logo.png" 
              alt="Feenix Repair" 
              className={cn(
                "object-contain",
                collapsed ? "h-7 w-auto" : "h-9 w-auto max-w-[160px]"
              )}
            />
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onToggle()
          }}
          className="hidden text-slate-400 transition-all hover:bg-slate-800/50 hover:text-white md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform hover:scale-110" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform hover:scale-110" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="text-slate-400 transition-all hover:bg-slate-800/50 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Navigation Area */}
      <nav 
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE/Edge */
        }}
        aria-label="Admin sidebar"
      >
        <style jsx>{`
          nav::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
          }
        `}</style>
        
        <ul className="space-y-1">
          {Object.entries(groupLabels).map(([group, label]) => {
            const groupItems = navItems.filter(item => item.group === group)
            if (groupItems.length === 0) return null

            return (
              <React.Fragment key={group}>
                {label && !collapsed && (
                  <div className="mb-2 mt-4 px-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                )}
                {groupItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href!}
                        onClick={onMobileClose}
                        className={cn(
                          "group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                          active
                            ? "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-400"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
                          collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
                        )}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.title : undefined}
                      >
                        {/* Active indicator */}
                        {active && !collapsed && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-blue-500"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                            active
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                              : "text-slate-400 group-hover:bg-slate-700/50 group-hover:text-slate-200"
                          )}
                        >
                          <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </span>
                        
                        <span
                          className={cn(
                            "whitespace-nowrap transition-all duration-200",
                            collapsed ? "w-0 overflow-hidden opacity-0" : "flex-1 opacity-100"
                          )}
                        >
                          {item.title}
                        </span>
                        
                        {!collapsed && item.badge && (
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-semibold text-white"
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </React.Fragment>
            )
          })}
        </ul>
      </nav>

      {/* Fixed Footer */}
      <div className="shrink-0 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm p-3">
        <div className="space-y-2">
          {/* Admin Profile */}
          {!collapsed && (
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/30 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">Admin</p>
                <p className="text-[10px] text-slate-500 truncate">Administrator</p>
              </div>
            </div>
          )}
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full rounded-lg text-sm font-medium transition-all duration-200",
              "text-slate-400 hover:bg-red-500/10 hover:text-red-400",
              collapsed ? "justify-center px-2 py-2.5" : "justify-start gap-3 px-3 py-2.5"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                "bg-slate-800/50 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-400"
              )}
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
            </span>
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-200",
                collapsed ? "w-0 overflow-hidden opacity-0" : "flex-1 opacity-100"
              )}
            >
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          "hidden h-dvh shrink-0 overflow-hidden border-r border-slate-800/50 transition-all duration-300 ease-in-out md:flex",
          collapsed ? "w-16" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 h-dvh w-[280px] border-r border-slate-800/50 bg-slate-950 shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
