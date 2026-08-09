"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { adminQuickActions } from "./data"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickActions() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {adminQuickActions.map((action, index) => {
        const Icon = action.icon
        return (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.15 + index * 0.05,
              ease: [0.4, 0, 0.2, 1],
            }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={action.href} className="group block h-full">
              <Card className="relative h-full overflow-hidden rounded-2xl border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition-all group-hover:shadow-lg">
                <CardContent className="flex flex-col justify-between p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <span
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                        action.color
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )
      })}
    </section>
  )
}
