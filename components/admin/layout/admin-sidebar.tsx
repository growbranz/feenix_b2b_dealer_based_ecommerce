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
  FileText,
  Image,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Activity,
  MessageSquare,
  ShoppingCart,
  Warehouse,
  CreditCard,
} from "lucide-react"

export interface AdminNavItem {
  title: string
  href?: string
  icon: LucideIcon
  badge?: number
  comingSoon?: boolean
}

const navItems: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Dealers", href: "/admin/dealers", icon: Users, badge: 12 },
  { title: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  { title: "Categories", href: "/admin/categories", icon: Folder },
  { title: "Brands", href: "/admin/brands", icon: Tag },
  { title: "Models", href: "/admin/models", icon: Box },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: 4 },
  { title: "Payments", href: "/admin/payments", icon: CreditCard },
  { title: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { title: "CMS", href: "/admin/cms", icon: FileText },
  { title: "Banners", href: "/admin/banners", icon: Image },
  { title: "Featured", href: "/admin/featured-products", icon: Sparkles },
  { title: "Activity", href: "/admin/activity", icon: Activity },
  { title: "Analytics", icon: BarChart3, comingSoon: true },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

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
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <Link
                href="/admin"
                className="whitespace-nowrap text-lg font-bold tracking-tight text-white"
              >
                Feenix Admin
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin sidebar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const content = (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 group-hover:bg-slate-800 group-hover:text-white"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 flex-1 overflow-hidden whitespace-nowrap text-slate-200 group-hover:text-white"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.comingSoon && (
                  <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    Soon
                  </span>
                )}
                {!collapsed && item.badge ? (
                  <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </>
            )

            return (
              <li key={item.title}>
                {item.href && !item.comingSoon ? (
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white",
                      collapsed && "justify-center px-2"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    disabled
                    className={cn(
                      "flex w-full cursor-not-allowed items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 opacity-50",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    {content}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start rounded-xl text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
            <LogOut className="h-[18px] w-[18px]" />
          </span>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 overflow-hidden whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden h-screen flex-col border-r border-slate-800 bg-slate-950 md:flex"
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-800 bg-slate-950 shadow-2xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
