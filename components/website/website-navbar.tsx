"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, ChevronDown, User, LogIn, UserPlus, ShoppingCart, Sparkles, Globe } from "lucide-react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"

export function WebsiteNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [categoriesOpen, setCategoriesOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null)
  
  const { scrollY } = useScroll()
  const navbarBackground = useTransform(
    scrollY,
    [0, 50, 100],
    ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.95)"]
  )
  const navbarBlur = useTransform(scrollY, [0, 50], [8, 20])
  const navbarShadow = useTransform(
    scrollY,
    [0, 50],
    ["0 1px 2px rgba(0, 0, 0, 0.05)", "0 4px 20px -8px rgba(30, 41, 59, 0.1)"]
  )

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

  return (
    <motion.header
      style={{
        background: navbarBackground,
        backdropFilter: `blur(${navbarBlur}px)`,
        boxShadow: navbarShadow,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/40 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              />
              <div className="relative flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  🔥
                </motion.div>
                <div className="text-2xl font-extrabold font-poppins bg-gradient-to-r from-slate-900 via-blue-700 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  Feenix Repair
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink href="/" label="Home" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />

            {/* Categories with Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors relative group ${
                  categoriesOpen || hoveredLink === 'categories' 
                    ? 'text-blue-600' 
                    : 'text-slate-700 hover:text-blue-600'
                }`}
                onMouseEnter={() => setHoveredLink('categories')}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span>Categories</span>
                <motion.div
                  animate={{ rotate: categoriesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
                {(categoriesOpen || hoveredLink === 'categories') && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_32px_64px_-16px_rgba(30,41,59,0.15)] border border-slate-100/80 overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 mb-2">
                        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span>Popular Categories</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {categories.map((category, index) => (
                          <motion.div
                            key={category.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Link
                              href={category.href}
                              className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all group"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{category.icon}</span>
                                <span className="font-medium">{category.name}</span>
                              </div>
                              <span className="text-xs text-slate-400 group-hover:text-blue-500">{category.count}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink href="/products" label="Products" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
            <NavLink href="/about" label="About" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
            <NavLink href="/contact" label="Contact" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} />
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-full transition-colors group"
            >
              <ShoppingCart className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
                  >
                    3
                  </motion.span>
                </motion.button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 h-10 pl-10 pr-10 rounded-full border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchOpen(true)}
                    aria-label="Open search"
                    className="p-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-full transition-colors group"
                  >
                    <Search className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/auth/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-full border-2 border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all shadow-sm hover:shadow-md"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    className="gap-2 rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:shadow-xl transition-all border-0 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                    <UserPlus className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Register</span>
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6 text-slate-700" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6 text-slate-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-4">
              <nav className="flex flex-col space-y-2">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/categories', label: 'Categories' },
                  { href: '/products', label: 'Products' },
                  { href: '/about', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 py-3 px-4 rounded-xl block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-200/60 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search products..." 
                      className="w-full pl-10 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2 border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full gap-2 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 transition-all">
                      <UserPlus className="h-4 w-4" />
                      Register
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
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
      className={`text-sm font-medium transition-colors relative group ${
        hoveredLink === label ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
      }`}
      onMouseEnter={() => setHoveredLink(label)}
      onMouseLeave={() => setHoveredLink(null)}
    >
      <motion.span
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {label}
      </motion.span>
      {hoveredLink === label && (
        <motion.span
          layoutId="navbar-underline"
          className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
}
