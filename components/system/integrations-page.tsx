"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getIntegrations, updateIntegrationConfig, toggleIntegration, getHealthOverview } from "@/lib/integrations/actions"
import { KpiCard } from "@/components/analytics/kpi-card"
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react"

const statusIcons: Record<string, any> = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  unknown: HelpCircle,
}

const statusColors: Record<string, string> = {
  healthy: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-rose-500",
  unknown: "text-slate-400",
}

export function IntegrationsPage() {
  const [integrations, setIntegrations] = React.useState<any[]>([])
  const [health, setHealth] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  async function load() {
    setLoading(true)
    try {
      const [i, h] = await Promise.all([getIntegrations(), getHealthOverview()])
      setIntegrations(i)
      setHealth(h)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  async function toggle(id: string, active: boolean) {
    await toggleIntegration(id, active)
    await load()
  }

  async function saveConfig(id: string, key: string, value: string) {
    const existing = integrations.find((i) => i.id === id)
    if (!existing) return
    const config = { ...existing.config, [key]: value }
    await updateIntegrationConfig(id, config)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Integrations</h2>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading || !health ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total" value={health.total} icon={CheckCircle} color="text-blue-500" />
          <KpiCard title="Healthy" value={health.healthy} icon={CheckCircle} color="text-emerald-500" />
          <KpiCard title="Warning" value={health.warning} icon={AlertTriangle} color="text-amber-500" />
          <KpiCard title="Error" value={health.error} icon={XCircle} color="text-rose-500" />
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration: any, idx: number) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{integration.name}</h3>
                <p className="text-xs text-slate-500">{integration.provider} · {integration.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={integration.is_active}
                  onChange={(e) => toggle(integration.id, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Object.entries(integration.config || {}).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-slate-500 capitalize">{key.replace(/_/g, " ")}</label>
                  <input
                    type="text"
                    defaultValue={String(value)}
                    onBlur={(e) => saveConfig(integration.id, key, e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
