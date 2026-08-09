"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Shield, Truck, Zap, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Shield, label: "Verified Dealers" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Zap, label: "Secure Payments" },
  { icon: MessageSquare, label: "Realtime Enquiry" },
]

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 lg:pt-24 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.03),transparent_50%)]" />
      </div>

      <div className="container-premium relative z-10 w-full">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20"
            >
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">India's Largest B2B Marketplace</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900"
            >
              India's Largest{" "}
              <span className="text-blue-600">Mobile Spare Parts</span>{" "}
              Marketplace
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-600 max-w-xl leading-relaxed"
            >
              Connect with verified dealers and buy genuine mobile spare parts across India with fast delivery and secure payments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="gap-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all h-12 px-8">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="gap-2 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all h-12 px-8">
                  Become Dealer
                </Button>
              </Link>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{feature.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative flex items-center justify-center"
            >
              <img
                src="/images/hero_img.png"
                alt="Mobile Spare Parts"
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
