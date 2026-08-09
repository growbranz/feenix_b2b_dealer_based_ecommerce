"use client"

import { motion } from "framer-motion"
import { Sparkles, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDealer } from "./dealer-provider"

export function DashboardHeader() {
  const dealer = useDealer()
  const name = dealer?.name || dealer?.business_name || "Dealer"

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-2xl"
    >
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dealer Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Welcome back, {name}
          </h1>
          <p className="text-lg text-white/90 md:text-xl">
            Manage your mobile spare parts efficiently. Track inventory, monitor
            orders, and grow your business from one place.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90 font-semibold"
            >
              Add Product
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold"
            >
              View Reports
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20"
        >
          <div className="rounded-xl bg-white/20 p-3">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-white/70 font-medium">Monthly Growth</p>
            <p className="text-3xl font-bold">+24.5%</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
    </motion.section>
  )
}
