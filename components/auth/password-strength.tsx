"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
}

function scorePassword(password: string) {
  let score = 0
  if (!password) return 0

  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score >= 4 && password.length >= 10) score += 1

  return Math.min(score, 5)
}

const labels = ["Empty", "Very Weak", "Weak", "Fair", "Good", "Strong"]
const colors = ["bg-slate-200", "bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500", "bg-emerald-600"]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const score = React.useMemo(() => scorePassword(password), [password])

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className={cn(
              "h-full flex-1 rounded-full transition-colors duration-300",
              idx <= score ? colors[score] : "bg-slate-100"
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", score === 0 ? "text-slate-400" : "text-slate-600")}>
          {labels[score]}
        </span>
        <span className="text-slate-400">
          {password.length >= 8 && score < 4 ? "Add uppercase, number & symbol" : ""}
        </span>
      </div>
    </div>
  )
}
