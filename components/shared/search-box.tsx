"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SearchBoxProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  className?: string
}

export function SearchBox({
  placeholder = "Search...",
  value: controlledValue,
  onChange,
  onClear,
  className
}: SearchBoxProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState("")

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleChange = (newValue: string) => {
    if (isControlled) {
      onChange?.(newValue)
    } else {
      setUncontrolledValue(newValue)
      onChange?.(newValue)
    }
  }

  const handleClear = () => {
    handleChange("")
    onClear?.()
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-6 w-6"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
