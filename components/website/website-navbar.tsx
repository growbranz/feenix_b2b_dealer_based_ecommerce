"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, User, LogIn, UserPlus, Sparkles, Home, Grid3X3, Package, Info, Mail, Settings, LogOut, FileText, ShoppingCart, Camera, Battery, Monitor, Speaker, Zap, Cpu, Fingerprint, Smartphone, Mic, LucideIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthProvider"
import { ChatAvatar } from "@/components/chat/chat-avatar"

const categoryIconMap: Record<string, LucideIcon> = {
  camera: Camera,
  battery: Battery,
  monitor: Monitor,
  speaker: Speaker,
  zap: Zap,
  cpu: Cpu,
  fingerprint: Fingerprint,
  smartphone: Smartphone,
  mic: Mic,
}

interface NavbarCategory {
  name: string
  slug: string
  icon: string | null
  count: number
}

interface WebsiteNavbarProps {
  categories: NavbarCategory[]
}

export function WebsiteNavbar({ categories }: WebsiteNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [categoriesOpen, setCategoriesOpen] = React.useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false)
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null)

  const handleLogout = async () => {
    await logout()
    setProfileDropdownOpen(false)
    router.push("/")
  }

  const getDisplayName = () => {
    if (profile?.business_name) return profile.business_name
    if (profile?.name) return profile.name
    if (user?.email) return user.email
    return "User"
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categories', label: 'Categories', icon: Grid3X3 },
    { href: '/products', label: 'Products', icon: Package },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  const isActiveLink = (href: string) => {
    return pathname === href
  }

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
              <NavLink href="/" label="Home" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} isActive={isActiveLink('/')} />
              
              {/* Categories with Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    categoriesOpen || hoveredLink === 'categories' || isActiveLink('/categories')
                      ? 'text-blue-600' 
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                  onMouseEnter={() => setHoveredLink('categories')}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span>Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                  {(hoveredLink === 'categories' || isActiveLink('/categories')) && (
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
                        {categories.map((category) => {
                          const Icon = category.icon ? categoryIconMap[category.icon] : null
                          return (
                            <Link
                              key={category.slug}
                              href={`/products?category=${category.slug}`}
                              className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                {Icon && <Icon className="h-4 w-4" />}
                                <span>{category.name}</span>
                              </div>
                              <span className="text-xs text-slate-400">{category.count}</span>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="/products" label="Products" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} isActive={isActiveLink('/products')} />
              <NavLink href="/about" label="About" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} isActive={isActiveLink('/about')} />
              <NavLink href="/contact" label="Contact" hoveredLink={hoveredLink} setHoveredLink={setHoveredLink} isActive={isActiveLink('/contact')} />
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Auth Buttons - Show when logged out */}
              {!loading && !user && (
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
              )}

              {/* Profile Avatar - Show when logged in */}
              {!loading && user && (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-slate-100 rounded-full p-1 transition-colors"
                    aria-label="Open profile menu"
                  >
                    <ChatAvatar
                      name={getDisplayName()}
                      url={profile?.profile_image}
                      size="md"
                    />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="fixed inset-0 z-50"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-slate-100">
                            <div className="flex items-center space-x-3">
                              <ChatAvatar
                                name={getDisplayName()}
                                url={profile?.profile_image}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{getDisplayName()}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            {profile?.role === 'DEALER' && (
                              <>
                                <Link
                                  href="/dealer/profile"
                                  className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                  onClick={() => setProfileDropdownOpen(false)}
                                >
                                  <User className="h-4 w-4" />
                                  <span>My Profile</span>
                                </Link>
                                <Link
                                  href="/dealer/orders"
                                  className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                  onClick={() => setProfileDropdownOpen(false)}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  <span>My Orders</span>
                                </Link>
                                <Link
                                  href="/dealer/my-enquiries"
                                  className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                  onClick={() => setProfileDropdownOpen(false)}
                                >
                                  <FileText className="h-4 w-4" />
                                  <span>My Enquiries</span>
                                </Link>
                              </>
                            )}
                            <Link
                              href="/dealer/settings"
                              className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                            <div className="border-t border-slate-100 my-2" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
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
              {/* Profile Avatar - Show when logged in */}
              {!loading && user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Open menu"
                >
                  <ChatAvatar
                    name={getDisplayName()}
                    url={profile?.profile_image}
                    size="md"
                  />
                </button>
              )}

              {/* Menu Button - Show when logged out or as fallback */}
              {(loading || !user) && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Open menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6 text-slate-700" />
                  ) : (
                    <Menu className="h-6 w-6 text-slate-700" />
                  )}
                </button>
              )}
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
                  {!loading && !user ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 px-4 py-3">
                        <ChatAvatar
                          name={getDisplayName()}
                          url={profile?.profile_image}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{getDisplayName()}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                      {profile?.role === 'DEALER' && (
                        <>
                          <Link
                            href="/dealer/profile"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <User className="h-5 w-5" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/dealer/orders"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="h-5 w-5" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href="/dealer/my-enquiries"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <FileText className="h-5 w-5" />
                            <span>My Enquiries</span>
                          </Link>
                        </>
                      )}
                      <Link
                        href="/dealer/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  )}
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
  setHoveredLink,
  isActive
}: { 
  href: string
  label: string
  hoveredLink: string | null
  setHoveredLink: (link: string | null) => void
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors relative ${
        isActive ? 'text-blue-600' : hoveredLink === label ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
      }`}
      onMouseEnter={() => setHoveredLink(label)}
      onMouseLeave={() => setHoveredLink(null)}
    >
      {label}
      {(isActive || hoveredLink === label) && (
        <span className="absolute -bottom-8 left-0 right-0 h-[2px] bg-blue-600" />
      )}
    </Link>
  )
}
