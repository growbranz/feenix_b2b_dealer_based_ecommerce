"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getPreferences, updatePreference } from "@/lib/notifications/actions"
import { Mail, Smartphone, Bell } from "lucide-react"

const channelIcons: Record<string, React.ReactNode> = {
  in_app: <Bell className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  sms: <Smartphone className="h-4 w-4" />,
  whatsapp: <Smartphone className="h-4 w-4" />,
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getPreferences()
        setPreferences(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function toggle(pref: any) {
    const next = !pref.enabled
    await updatePreference(pref.id, next)
    setPreferences((prev) => prev.map((p) => (p.id === pref.id ? { ...p, enabled: next } : p)))
  }

  const grouped = React.useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const p of preferences) {
      map[p.category] = map[p.category] || []
      map[p.category].push(p)
    }
    return map
  }, [preferences])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, prefs]) => (
        <div key={category} className="rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold capitalize">{category.replace(/_/g, " ")}</h3>
          <div className="space-y-3">
            {prefs.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {channelIcons[pref.channel] || <Bell className="h-4 w-4" />}
                  <span className="capitalize">{pref.channel.replace(/_/g, " ")}</span>
                </div>
                <input
                  type="checkbox"
                  checked={pref.enabled}
                  onChange={() => toggle(pref)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
