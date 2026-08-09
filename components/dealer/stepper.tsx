"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  completedSteps: Set<number>
}

export function Stepper({ steps, currentStep, completedSteps }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(index)
        const isCurrent = index === currentStep
        const isPending = index > currentStep

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? "hsl(var(--primary))"
                    : isCurrent
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted))",
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted || isCurrent
                    ? "border-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </motion.div>
              <motion.span
                initial={false}
                animate={{
                  color: isCompleted || isCurrent
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                }}
                className="text-sm font-medium transition-colors"
              >
                {step.label}
              </motion.span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
