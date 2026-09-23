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
  getBannersAction,
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
  reorderBannersAction,
  toggleBannerStatusAction,
} from "@/lib/banners/actions"
import { getBannerStatus, type BannerStatus } from "@/lib/banners/service"
import type { Banner } from "@/types"
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, Upload, ImageIcon, RotateCcw, Filter } from "lucide-react"
import { cn, dateFormatter } from "@/lib/utils"

const emptyBanner: Omit<Banner, "id" | "created_at" | "updated_at"> = {
  title: "",
  image: "",
  subtitle: null,
  cta_label: null,
  cta_link: null,
  link: null,
  display_order: 0,
  status: "ACTIVE",
  start_date: null,
  end_date: null,
}

export function BannerManagement() {
  const [banners, setBanners] = React.useState<Banner[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Banner | null>(null)
  const [form, setForm] = React.useState<Omit<Banner, "id" | "created_at" | "updated_at">>(emptyBanner)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadBanners = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBannersAction()
      setBanners(data)
    } catch (e: any) {
      setError(e.message || "Failed to load banners")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadBanners()
  }, [loadBanners])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return banners
      .filter((b) => {
        const matchesSearch = !q || b.title.toLowerCase().includes(q)
        const computedStatus = getBannerStatus(b)
        const matchesStatus = statusFilter === "all" || computedStatus === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => a.display_order - b.display_order)
  }, [banners, search, statusFilter])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyBanner, display_order: banners.length + 1 })
    setImageFile(null)
    setDrawerOpen(true)
  }

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setForm(banner)
    setImageFile(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyBanner)
    setImageFile(null)
  }

  const handleSave = async () => {
    if (!form.title || !form.image) {
      setError("Title and image are required")
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateBannerAction(editing.id, form)
      } else {
        await createBannerAction(form)
      }
      await loadBanners()
      closeDrawer()
    } catch (e: any) {
      setError(e.message || "Failed to save banner")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // For now, use a placeholder URL. In production, this should upload to Supabase Storage
    return URL.createObjectURL(file)
  }

  const handleImageChange = async (file: File | null) => {
    if (file) {
      setImageFile(file)
      const imageUrl = await handleImageUpload(file)
      setForm((f) => ({ ...f, image: imageUrl }))
    }
  }

  const move = async (id: string, direction: "up" | "down") => {
    const sorted = [...filtered].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((b) => b.id === id)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    
    const temp = sorted[idx]
    sorted[idx] = sorted[swapIdx]
    sorted[swapIdx] = temp
    
    const reordered = sorted.map((b, i) => ({ ...b, display_order: i + 1 }))
    const bannerIds = reordered.map((b) => b.id)
    
    try {
      await reorderBannersAction(bannerIds)
      await loadBanners()
    } catch (e: any) {
      setError(e.message || "Failed to reorder banners")
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleBannerStatusAction(id)
      await loadBanners()
    } catch (e: any) {
      setError(e.message || "Failed to update banner status")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteBannerAction(deleteId)
      setDeleteId(null)
      await loadBanners()
    } catch (e: any) {
      setError(e.message || "Failed to delete banner")
    }
  }

  const updateForm = (field: keyof Omit<Banner, "id" | "created_at" | "updated_at">, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const computedStatus = (banner: Banner): BannerStatus => getBannerStatus(banner)

  const statusColor = (status: BannerStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "INACTIVE":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "EXPIRED":
        return "bg-rose-100 text-rose-700 border-rose-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Banners</h1>
          <p className="mt-1 text-sm text-slate-500">Manage homepage banners, scheduling, and ordering.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadBanners} disabled={loading}>
            <RotateCcw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button onClick={openAdd} className="rounded-full px-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search banners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm ring-offset-0 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-full md:w-44 rounded-xl"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="INACTIVE">Inactive</option>
          <option value="EXPIRED">Expired</option>
        </Select>
        {(search || statusFilter !== "all") && (
          <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all") }}>
            <Filter className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </motion.div>
      ) : banners.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No banners yet"
            description="Create your first banner to appear on the homepage."
            icon={ImageIcon}
            action={<Button onClick={openAdd}>Add Banner</Button>}
          />
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No banners found"
            description="No banners match your current filters."
            icon={ImageIcon}
            action={
              (search || statusFilter !== "all") && (
                <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all") }}>
                  Clear Filters
                </Button>
              )
            }
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Preview</th>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((banner, idx) => (
                  <tr key={banner.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-12 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-24 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-xs text-slate-500">{banner.subtitle}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{banner.display_order}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {banner.start_date || "-"} → {banner.end_date || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className={cn("border cursor-pointer", statusColor(computedStatus(banner)))}
                        onClick={() => handleToggleStatus(banner.id)}
                      >
                        {computedStatus(banner).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => move(banner.id, "up")}
                          disabled={idx === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => move(banner.id, "down")}
                          disabled={idx === filtered.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openEdit(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-rose-600"
                          onClick={() => setDeleteId(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? "Edit Banner" : "Add Banner"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Banner"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="Banner title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={form.subtitle || ""}
              onChange={(e) => updateForm("subtitle", e.target.value)}
              placeholder="Optional subtitle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image *</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-slate-500 hover:bg-slate-50">
              <Upload className="h-6 w-6" />
              <span className="mt-1 text-xs">
                {imageFile ? imageFile.name : form.image ? "Replace image" : "Upload banner image"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              />
            </label>
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-2 h-32 w-full rounded-lg object-cover"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cta_label">CTA Label</Label>
              <Input
                id="cta_label"
                value={form.cta_label || ""}
                onChange={(e) => updateForm("cta_label", e.target.value)}
                placeholder="e.g., Shop Now"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_link">CTA Link</Label>
              <Input
                id="cta_link"
                value={form.cta_link || ""}
                onChange={(e) => updateForm("cta_link", e.target.value)}
                placeholder="e.g., /products"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Direct Link (legacy)</Label>
            <Input
              id="link"
              value={form.link || ""}
              onChange={(e) => updateForm("link", e.target.value)}
              placeholder="Optional direct link"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={form.display_order}
                onChange={(e) => updateForm("display_order", Number(e.target.value))}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={form.start_date || ""}
                onChange={(e) => updateForm("start_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={form.end_date || ""}
                onChange={(e) => updateForm("end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value as "ACTIVE" | "INACTIVE")}
              className="rounded-xl"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </Select>
          </div>
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}
