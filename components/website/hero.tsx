"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="container-premium relative z-10 w-full">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20"
            >
              <span className="text-sm font-semibold text-blue-600 tracking-wide uppercase">
                India's Trusted B2B Marketplace
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900"
            >
              India's Largest{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                Mobile Spare Parts
              </span>{" "}
              Marketplace
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-lg text-slate-600 max-w-xl leading-relaxed"
            >
              Connect with verified dealers and source genuine mobile spare parts across India with fast delivery and secure payments.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link href="/products">
                  <Button 
                    size="lg" 
                    className="gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all h-12 px-8 font-semibold"
                  >
                    Browse Products
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Link href="/auth/register">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2 rounded-xl border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition-all h-12 px-8 font-semibold"
                  >
                    Become a Dealer
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <motion.div
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full aspect-square max-w-[600px] mx-auto"
            >
              {/* Subtle glow behind image */}
              <div className="absolute inset-[5%] rounded-full bg-gradient-to-br from-blue-100/50 to-white/50 blur-2xl" />
              
              {/* Hero Image */}
              <Image
                src="/hero.png"
                alt="Feenix Repair mobile spare parts marketplace"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain relative z-10"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
