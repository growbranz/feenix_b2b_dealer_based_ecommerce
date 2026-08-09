"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotificationsRealtime } from "@/hooks/notifications/use-notifications-realtime"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ToastNotification {
  id: string
  title: string
  message: string
  link?: string | null
}

export function NotificationToasts({ userId }: { userId: string }) {
  const [toasts, setToasts] = React.useState<ToastNotification[]>([])

  useNotificationsRealtime(userId, {
    onInsert: (n: any) => {
      if (n.is_read) return
      setToasts((prev) => [...prev, { id: n.id, title: n.title, message: n.message, link: n.link }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== n.id))
      }, 6000)
    },
  })

  function remove(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-xl border bg-white p-4 shadow-lg dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <Bell className="mt-1 h-5 w-5 text-orange-500" />
              <div className="min-w-0 flex-1">
                {toast.link ? (
                  <Link href={toast.link} className="block" onClick={() => remove(toast.id)}>
                    <p className="font-medium">{toast.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
                  </Link>
                ) : (
                  <>
                    <p className="font-medium">{toast.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.message}</p>
                  </>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => remove(toast.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
