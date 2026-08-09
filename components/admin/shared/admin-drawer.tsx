"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AdminDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: string
}

export function AdminDrawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-lg",
}: AdminDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed inset-y-0 right-0 z-50 flex w-full ${width} flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl`}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
            {footer && (
              <div className="shrink-0 border-t bg-slate-50/80 p-4 backdrop-blur-sm">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
