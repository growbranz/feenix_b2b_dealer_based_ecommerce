"use client"

import * as React from "react"
import { Sidebar, SidebarItem } from "@/components/shared/sidebar"
import { Navbar } from "@/components/shared/navbar"
import { LayoutDashboard, Search, Package, Plus, Warehouse, MessageSquare, ShoppingCart, TrendingUp, ShoppingBag, CreditCard, Mail, Bell, User } from "lucide-react"

const dealerSidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/dealer", icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: "Browse Products", href: "/dealer/browse", icon: <Search className="h-4 w-4" /> },
  { title: "My Products", href: "/dealer/products", icon: <Package className="h-4 w-4" /> },
  { title: "Add Product", href: "/dealer/products/add", icon: <Plus className="h-4 w-4" /> },
  { title: "Inventory", href: "/dealer/inventory", icon: <Warehouse className="h-4 w-4" /> },
  { title: "My Enquiries", href: "/dealer/enquiries", icon: <MessageSquare className="h-4 w-4" /> },
  { title: "Orders", href: "/dealer/orders", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "Sales", href: "/dealer/sales", icon: <TrendingUp className="h-4 w-4" /> },
  { title: "Purchases", href: "/dealer/purchases", icon: <ShoppingBag className="h-4 w-4" /> },
  { title: "Payments", href: "/dealer/payments", icon: <CreditCard className="h-4 w-4" /> },
  { title: "Messages", href: "/dealer/messages", icon: <Mail className="h-4 w-4" /> },
  { title: "Notifications", href: "/dealer/notifications", icon: <Bell className="h-4 w-4" />, badge: 3 },
  { title: "Profile", href: "/dealer/profile", icon: <User className="h-4 w-4" /> },
]

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        items={dealerSidebarItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title="Dealer Dashboard"
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
