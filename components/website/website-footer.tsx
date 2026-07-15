"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, ArrowUp, Share2 } from "lucide-react"

export function WebsiteFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-primary-foreground/80 bg-clip-text text-transparent mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
              Feenix Repair
            </h3>
            <p className="text-primary-foreground/80 leading-relaxed max-w-sm">
              India's largest B2B marketplace for mobile spare parts. Connecting verified dealers across the country for seamless trading.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">support@feenixrepair.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">Mumbai, Maharashtra</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4">
              <Link href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Share2 className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Share2 className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Share2 className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Share2 className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-lg mb-6" style={{ fontFamily: 'var(--font-poppins)' }}>Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary-foreground/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-lg mb-6" style={{ fontFamily: 'var(--font-poppins)' }}>Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/display" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Display
                </Link>
              </li>
              <li>
                <Link href="/categories/battery" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Battery
                </Link>
              </li>
              <li>
                <Link href="/categories/camera" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Camera
                </Link>
              </li>
              <li>
                <Link href="/categories/motherboard" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Motherboard
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary-foreground/80 hover:text-white transition-colors">
                  View All
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-lg mb-6" style={{ fontFamily: 'var(--font-poppins)' }}>Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-primary-foreground/80 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-primary-foreground/60 text-sm">
            &copy; {new Date().getFullYear()} Feenix Repair. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="p-3 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </footer>
  )
}
