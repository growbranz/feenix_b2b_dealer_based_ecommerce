"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { 
  Mail, Phone, MapPin, ArrowUp, Share2, 
  Shield, Headset, ArrowRight, CreditCard, Smartphone, Wallet 
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function WebsiteFooter() {
  const [year, setYear] = React.useState("")
  const [isVisible, setIsVisible] = React.useState(false)
  const footerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(footerRef, { once: false, amount: 0.1 })

  React.useEffect(() => {
    setYear(new Date().getFullYear().toString())
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer 
      ref={footerRef}
      className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Gradient Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="inline-block mb-4"
            >
              <img 
                src="/images/feenix-repair-logo.png" 
                alt="Feenix Repair" 
                className="h-16 w-auto object-contain"
              />
            </motion.div>
            <p className="text-slate-300 leading-relaxed max-w-sm">
              India's largest B2B marketplace for mobile spare parts. Connecting verified dealers across the country for seamless trading.
            </p>

            <div className="space-y-4">
              <motion.div 
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">support@feenixrepair.com</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">+91 98765 43210</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-slate-300 group-hover:text-white transition-colors">Mumbai, Maharashtra, India</span>
              </motion.div>
            </div>

            {/* Social Media */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-slate-400 mb-4">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { icon: Share2, href: '#', label: 'Facebook', emoji: '📘' },
                  { icon: Share2, href: '#', label: 'Instagram', emoji: '📷' },
                  { icon: Share2, href: '#', label: 'LinkedIn', emoji: '💼' },
                  { icon: Share2, href: '#', label: 'YouTube', emoji: '📺' },
                ].map((social, index) => (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link 
                      href={social.href} 
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-blue-500 text-slate-300 hover:text-white transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 flex items-center justify-center text-xl"
                      aria-label={social.label}
                    >
                      {social.emoji}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bold text-lg mb-6 text-white" style={{ fontFamily: 'var(--font-poppins)' }}>Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/categories', label: 'Categories' },
                { href: '/products', label: 'Products' },
                { href: '/contact', label: 'Contact Us' },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-all duration-300 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-400 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-bold text-lg mb-6 text-white" style={{ fontFamily: 'var(--font-poppins)' }}>Categories</h4>
            <ul className="space-y-3">
              {[
                { href: '/categories/display', label: 'Display' },
                { href: '/categories/battery', label: 'Battery' },
                { href: '/categories/camera', label: 'Camera' },
                { href: '/categories/motherboard', label: 'Motherboard' },
                { href: '/categories', label: 'View All Categories', highlight: true },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className={`flex items-center gap-2 transition-all duration-300 group ${
                      link.highlight 
                        ? 'text-blue-400 hover:text-blue-300 font-medium' 
                        : 'text-slate-300 hover:text-blue-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      link.highlight 
                        ? 'bg-blue-400' 
                        : 'bg-blue-500/0 group-hover:bg-blue-400'
                    }`} />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="font-bold text-lg mb-6 text-white" style={{ fontFamily: 'var(--font-poppins)' }}>Legal</h4>
            <ul className="space-y-3">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/refund', label: 'Refund Policy' },
                { href: '/shipping', label: 'Shipping Policy' },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-all duration-300 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-400 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Need Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            <motion.div 
              animate={{ 
                x: [0, 100, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
            />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl"
                >
                  🎧
                </motion.div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Need Help?</h4>
                  <p className="text-slate-300">We're here to help your business grow.</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contact">
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/30 border-0">
                    Contact Support
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="border-t border-white/10 bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Security Badge */}
            <motion.div 
              className="flex items-center gap-3 text-slate-400"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-full bg-green-500/20"
              >
                <Shield className="h-5 w-5 text-green-400" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-green-400">100% Secure Transactions</span>
                <span className="text-xs text-slate-500">Safe & trusted by thousands of dealers</span>
              </div>
            </motion.div>

            {/* Copyright */}
            <p className="text-slate-400 text-sm text-center">
              &copy; {year || "2026"} Feenix Repair. All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-sm hidden sm:block">Payment Methods:</span>
              <div className="flex gap-3">
                {[
                  { icon: CreditCard, label: 'VISA' },
                  { icon: CreditCard, label: 'Mastercard' },
                  { icon: Smartphone, label: 'RuPay' },
                  { icon: Wallet, label: 'UPI' },
                ].map((payment, index) => (
                  <motion.div
                    key={payment.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                    title={payment.label}
                  >
                    <payment.icon className="h-5 w-5 text-slate-300" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  )
}
