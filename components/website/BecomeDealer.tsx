"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Phone, Mail, TrendingUp } from "lucide-react"
import Link from "next/link"

export function BecomeDealer() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center"
            >
              <TrendingUp className="h-10 w-10 text-white" />
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold font-poppins text-white leading-tight">
              Become a Dealer and Grow Your Business
            </h2>
            
            <p className="text-xl text-white/90 max-w-xl">
              Join thousands of successful dealers who are already scaling their business on Feenix Repair. Start your journey today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-xl">
                  Become Dealer
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30">
                  Contact Sales
                </button>
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/90">24/7 Support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/90">Quick Setup</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
              >
                <div className="text-3xl font-bold text-white">5000+</div>
                <div className="text-white/90 text-sm">Active Dealers</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 left-0 bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30"
              >
                <div className="text-3xl font-bold text-white">₹50Cr+</div>
                <div className="text-white/90 text-sm">Monthly Transactions</div>
              </motion.div>

              {/* Central Illustration */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-8xl text-center">🚀</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
