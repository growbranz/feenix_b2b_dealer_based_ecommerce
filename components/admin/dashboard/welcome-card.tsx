"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function WelcomeCard({ name = "Admin" }: { name?: string }) {
  const now = new Date()
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card className="relative overflow-hidden rounded-2xl border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <CardContent className="relative flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Admin Dashboard
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {name}
            </h1>
            <p className="mt-1 text-sm text-blue-100">{dateString}</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-3xl font-bold">{now.toLocaleDateString("en-US", { day: "2-digit" })}</p>
            <p className="text-sm text-blue-100 uppercase tracking-wide">
              {now.toLocaleDateString("en-US", { month: "short" })}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
