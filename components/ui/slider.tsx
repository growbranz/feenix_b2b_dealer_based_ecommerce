"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    value?: number[]; 
    onValueChange?: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
  }
>(({ className, value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (index: number, newValue: number) => {
    const newValues = [...value]
    newValues[index] = newValue
    onValueChange?.(newValues)
  }

  return (
    <div ref={ref} className={cn("relative w-full h-2 bg-secondary rounded-lg", className)} {...props}>
      {value.map((val, index) => (
        <input
          key={index}
          type="range"
          className={cn(
            "absolute w-full h-2 appearance-none cursor-pointer accent-primary",
            "bg-transparent"
          )}
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => handleChange(index, Number(e.target.value))}
          style={{ pointerEvents: index === 0 ? 'auto' : 'none' }}
        />
      ))}
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
