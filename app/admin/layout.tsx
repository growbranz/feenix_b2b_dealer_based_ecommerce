"use client"

import * as React from "react"
import { Sidebar, SidebarItem } from "@/components/shared/sidebar"
import { Navbar } from "@/components/shared/navbar"
import { LayoutDashboard, Users, Folder, Tag, Package, MessageSquare, ShoppingCart, CreditCard, Warehouse, BarChart3, Globe, Mail, Bell, Settings, User } from "lucide-react"

const adminSidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: "Dealers", href: "/admin/dealers", icon: <Users className="h-4 w-4" /> },
  { title: "Categories", href: "/admin/categories", icon: <Folder className="h-4 w-4" /> },
  { title: "Brands", href: "/admin/brands", icon: <Tag className="h-4 w-4" /> },
  { title: "Models", href: "/admin/models", icon: <Package className="h-4 w-4" /> },
  { title: "Products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
  { title: "Enquiries", href: "/admin/enquiries", icon: <MessageSquare className="h-4 w-4" /> },
  { title: "Orders", href: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "Payments", href: "/admin/payments", icon: <CreditCard className="h-4 w-4" /> },
  { title: "Inventory", href: "/admin/inventory", icon: <Warehouse className="h-4 w-4" /> },
  { title: "Reports", href: "/admin/reports", icon: <BarChart3 className="h-4 w-4" /> },
  { title: "Website CMS", href: "/admin/cms", icon: <Globe className="h-4 w-4" /> },
  { title: "Messages", href: "/admin/messages", icon: <Mail className="h-4 w-4" /> },
  { title: "Notifications", href: "/admin/notifications", icon: <Bell className="h-4 w-4" />, badge: 5 },
  { title: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
  { title: "Profile", href: "/admin/profile", icon: <User className="h-4 w-4" /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={adminSidebarItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title="Admin Dashboard"
          showSearch
          showNotifications
          showProfile
          showThemeToggle
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
