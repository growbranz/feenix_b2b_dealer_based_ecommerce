"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { EmptyState } from "@/components/shared/empty-state"
import { Select } from "@/components/ui/select"
import {
  getMarketplaceStatsAction,
  createMarketplaceStatAction,
  updateMarketplaceStatAction,
  deleteMarketplaceStatAction,
  reorderMarketplaceStatsAction,
  toggleMarketplaceStatStatusAction,
} from "@/lib/marketplace-stats/actions"
import { getIconComponent, ICON_MAP } from "@/lib/marketplace-stats/service"
import type { MarketplaceStat } from "@/types"
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, RotateCcw, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"

const emptyStat: Omit<MarketplaceStat, "id" | "created_at" | "updated_at"> = {
  stat_key: "",
  value: "",
  label: "",
  icon: "package",
  display_order: 0,
  is_active: true,
}

const ICON_OPTIONS = Object.entries(ICON_MAP).map(([key, value]) => ({
  value: key,
  label: value,
}))

export function MarketplaceStatsManagement() {
  const [stats, setStats] = React.useState<MarketplaceStat[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<MarketplaceStat | null>(null)
  const [form, setForm] = React.useState<Omit<MarketplaceStat, "id" | "created_at" | "updated_at">>(emptyStat)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadStats = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMarketplaceStatsAction()
      setStats(data)
    } catch (e: any) {
      setError(e.message || "Failed to load marketplace stats")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyStat, display_order: stats.length + 1 })
    setDrawerOpen(true)
  }

  const openEdit = (stat: MarketplaceStat) => {
    setEditing(stat)
    setForm(stat)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyStat)
  }

  const handleSave = async () => {
    if (!form.value || !form.label || !form.stat_key) {
      setError("Value, label, and stat key are required")
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateMarketplaceStatAction(editing.id, form, editing.value)
      } else {
        await createMarketplaceStatAction(form)
      }
      await loadStats()
      closeDrawer()
    } catch (e: any) {
      const errorMessage = e?.message || "Unable to save marketplace statistic. Please check your database configuration."
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const move = async (id: string, direction: "up" | "down") => {
    const sorted = [...stats].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((s) => s.id === id)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    
    const temp = sorted[idx]
    sorted[idx] = sorted[swapIdx]
    sorted[swapIdx] = temp
    
    const reordered = sorted.map((s, i) => ({ ...s, display_order: i + 1 }))
    const statIds = reordered.map((s) => s.id)
    
    try {
      await reorderMarketplaceStatsAction(statIds)
      await loadStats()
    } catch (e: any) {
      setError(e.message || "Failed to reorder marketplace stats")
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleMarketplaceStatStatusAction(id)
      await loadStats()
    } catch (e: any) {
      setError(e.message || "Failed to update marketplace stat status")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMarketplaceStatAction(deleteId)
      setDeleteId(null)
      await loadStats()
    } catch (e: any) {
      setError(e.message || "Failed to delete marketplace stat")
    }
  }

  const updateForm = (field: keyof Omit<MarketplaceStat, "id" | "created_at" | "updated_at">, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const getIconComponentByName = (iconName: string | null) => {
    const componentName = getIconComponent(iconName)
    const IconComponent = (LucideIcons as any)[componentName]
    return IconComponent || LucideIcons.Package
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {error && (
        <motion.div variants={itemVariants} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Marketplace Stats</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the statistics displayed on the public website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RotateCcw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button onClick={openAdd} className="rounded-full px-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Statistic
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </motion.div>
      ) : stats.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No statistics yet"
            description="Create your first marketplace statistic to appear on the public website."
            icon={BarChart3}
            action={<Button onClick={openAdd}>Add Statistic</Button>}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Icon</th>
                  <th className="px-5 py-3.5">Label</th>
                  <th className="px-5 py-3.5">Value</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map((stat, idx) => {
                  const Icon = getIconComponentByName(stat.icon)
                  return (
                    <tr key={stat.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Icon className="h-5 w-5" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{stat.label}</div>
                        <div className="text-xs text-slate-500">{stat.stat_key}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{stat.value}</td>
                      <td className="px-5 py-4 text-slate-600">{stat.display_order}</td>
                      <td className="px-5 py-4">
                        <Badge
                          className={cn(
                            "border cursor-pointer",
                            stat.is_active
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          )}
                          onClick={() => handleToggleStatus(stat.id)}
                        >
                          {stat.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => move(stat.id, "up")}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => move(stat.id, "down")}
                            disabled={idx === stats.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => openEdit(stat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-rose-600"
                            onClick={() => setDeleteId(stat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? "Edit Statistic" : "Add Statistic"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Statistic"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stat_key">Stat Key *</Label>
            <Input
              id="stat_key"
              value={form.stat_key}
              onChange={(e) => updateForm("stat_key", e.target.value)}
              placeholder="e.g., products_listed"
              disabled={!!editing}
            />
            <p className="text-xs text-slate-500">Unique identifier (cannot be changed after creation)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              value={form.value}
              onChange={(e) => updateForm("value", e.target.value)}
              placeholder="e.g., 25K+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => updateForm("label", e.target.value)}
              placeholder="e.g., Products Listed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              id="icon"
              value={form.icon || "package"}
              onChange={(e) => updateForm("icon", e.target.value)}
              className="rounded-xl"
            >
              {ICON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={form.display_order}
                onChange={(e) => updateForm("display_order", Number(e.target.value))}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={form.is_active ? "true" : "false"}
                onChange={(e) => updateForm("is_active", e.target.value === "true")}
                className="rounded-xl"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Statistic"
        description="Are you sure you want to delete this marketplace statistic? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}
