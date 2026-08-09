"use client"

import * as React from "react"
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  hint?: string
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, success, hint, className, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    return (
      <div className="relative">
        <div className="relative group">
          <input
            ref={ref}
            type={inputType}
            placeholder=" "
            className={cn(
              "peer block w-full rounded-xl border bg-white px-4 pb-3 pt-6 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-transparent focus:ring-0",
              "h-14 border-slate-200 hover:border-blue-300 focus:border-blue-500",
              error && "border-red-400 focus:border-red-500 bg-red-50/20",
              success && !error && "border-emerald-400 focus:border-emerald-500 bg-emerald-50/20",
              isPassword && "pr-11",
              className
            )}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 transition-all duration-200 pointer-events-none",
              "peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-blue-600",
              "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
              error && "text-red-500 peer-focus:text-red-600",
              success && !error && "text-emerald-600 peer-focus:text-emerald-600"
            )}
          >
            {label}
          </label>

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {!isPassword && success && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
          )}
        </div>

        {error ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          ref={ref}
          placeholder=" "
          className={cn(
            "peer block w-full rounded-xl border bg-white px-4 pb-3 pt-6 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-transparent focus:ring-0 resize-none",
            "min-h-[120px] border-slate-200 hover:border-blue-300 focus:border-blue-500",
            error && "border-red-400 focus:border-red-500 bg-red-50/20",
            className
          )}
          {...props}
        />
        <label
          className={cn(
            "absolute left-4 top-5 text-sm text-slate-500 transition-all duration-200 pointer-events-none",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",
            error && "text-red-500 peer-focus:text-red-600"
          )}
        >
          {label}
        </label>
        {error && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </div>
    )
  }
)
FloatingTextarea.displayName = "FloatingTextarea"
