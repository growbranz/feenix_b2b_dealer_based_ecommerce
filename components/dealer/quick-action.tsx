"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { quickActions } from "./data"

export function QuickActions() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((action, index) => {
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
              <Card className="relative h-full overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-sm backdrop-blur-sm transition-all group-hover:shadow-lg">
                <CardContent className="flex flex-col justify-between p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
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
