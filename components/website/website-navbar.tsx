"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, ChevronDown, User, LogIn, UserPlus, ShoppingCart, Sparkles, Home, Grid3X3, Package, Info, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function WebsiteNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [categoriesOpen, setCategoriesOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null)

  const categories = [
    { name: "Display", href: "/categories/display", icon: "📱", count: 245 },
    { name: "Battery", href: "/categories/battery", icon: "🔋", count: 189 },
    { name: "Camera", href: "/categories/camera", icon: "📷", count: 156 },
    { name: "Motherboard", href: "/categories/motherboard", icon: "🔧", count: 98 },
    { name: "Charging Port", href: "/categories/charging-port", icon: "⚡", count: 134 },
    { name: "Speaker", href: "/categories/speaker", icon: "🔊", count: 87 },
    { name: "Back Panel", href: "/categories/back-panel", icon: "📲", count: 112 },
    { name: "Fingerprint", href: "/categories/fingerprint", icon: "👆", count: 45 },
    { name: "IC Chips", href: "/categories/ic-chips", icon: "💾", count: 67 },
  ]

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categories', label: 'Categories', icon: Grid3X3 },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-4 left-4 right-4 z-50">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center rounded-xl bg-white p-1.5 shadow-sm border border-slate-100">
              <img 
                src="/images/feenix-repair-logo.png" 
                alt="Feenix Repair" 
                className="h-11 w-auto max-w-[180px] object-contain"
              />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <NavLink href="/" label="Home" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
              
              {/* Categories with Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    categoriesOpen || hoveredLink === 'categories' 
                      ? 'text-blue-600' 
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                  onMouseEnter={() => setHoveredLink('categories')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span>Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                  {hoveredLink === 'categories' && (
                    <span className="absolute -bottom-8 left-0 right-0 h-[2px] bg-blue-600" />
                  )}
                </button>

                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                      <div className="p-2">
                        {categories.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                            <span className="text-xs text-slate-400">{category.count}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="/products" label="Products" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
              <NavLink href="/about" label="About" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
              <NavLink href="/contact" label="Contact" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ShoppingCart className="h-5 w-5 text-slate-700" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full text-[10px] font-semibold text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Search */}
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Search className="h-5 w-5 text-slate-700" />
              </button>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-4 left-4 right-4 z-50">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center rounded-xl bg-white p-1.5 shadow-sm border border-slate-100">
              <img 
                src="/images/feenix-repair-logo.png" 
                alt="Feenix Repair" 
                className="h-9 w-auto max-w-[150px] object-contain"
              />
            </Link>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Cart */}
              <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ShoppingCart className="h-5 w-5 text-slate-700" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 rounded-full text-[10px] font-semibold text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Search */}
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Search className="h-5 w-5 text-slate-700" />
              </button>

              {/* Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Sidebar Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white rounded-r-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <Link href="/" className="flex items-center rounded-xl bg-white p-1.5 shadow-sm border border-slate-100" onClick={() => setMobileMenuOpen(false)}>
                    <img 
                      src="/images/feenix-repair-logo.png" 
                      alt="Feenix Repair" 
                      className="h-9 w-auto max-w-[150px] object-contain"
                    />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-700" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                            hoveredLink === item.label
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                          onMouseEnter={() => setHoveredLink(item.label)}
                          onMouseLeave={() => setHoveredLink(null)}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          {item.label === 'Categories' && (
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>

                {/* Auth Buttons */}
                <div className="p-4 border-t border-slate-100 space-y-3">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// NavLink Component for reusable navigation links
function NavLink({ 
  href, 
  label, 
  hoveredLink, 
  setHoveredLink 
}: { 
  href: string
  label: string
  hoveredLink: string | null
  setHoveredLink: (link: string | null) => void 
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors relative ${
        hoveredLink === label ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
      }`}
      onMouseEnter={() => setHoveredLink(label)}
      onMouseLeave={() => setHoveredLink(null)}
    >
      {label}
      {hoveredLink === label && (
        <span className="absolute -bottom-8 left-0 right-0 h-[2px] bg-blue-600" />
      )}
    </Link>
  )
}
