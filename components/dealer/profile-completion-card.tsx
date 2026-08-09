"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProfileCompletionCardProps {
  percentage: number
  className?: string
}

export function ProfileCompletionCard({
  percentage,
  className,
}: ProfileCompletionCardProps) {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full max-w-sm", className)}
    >
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-chart-2/5 backdrop-blur-sm">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {percentage}%
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Profile Complete</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete your profile to increase visibility and trust with buyers.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
