"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { mockBanners, AdminBanner, BannerStatus } from "./data"
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, Upload, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const emptyBanner: AdminBanner = {
  id: "",
  title: "",
  desktop_url: null,
  mobile_url: null,
  link: "",
  priority: 0,
  status: "ACTIVE",
  start_date: "",
  end_date: "",
  created_at: new Date().toISOString(),
}

export function BannerManagement() {
  const [banners, setBanners] = React.useState<AdminBanner[]>(mockBanners.sort((a, b) => a.priority - b.priority))
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminBanner | null>(null)
  const [form, setForm] = React.useState<AdminBanner>(emptyBanner)
  const [desktopFile, setDesktopFile] = React.useState<File | null>(null)
  const [mobileFile, setMobileFile] = React.useState<File | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return banners
      .filter((b) => {
        const matchesSearch = !q || b.title.toLowerCase().includes(q)
        const matchesStatus = statusFilter === "all" || b.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => a.priority - b.priority)
  }, [banners, search, statusFilter])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyBanner, priority: banners.length + 1 })
    setDesktopFile(null)
    setMobileFile(null)
    setDrawerOpen(true)
  }

  const openEdit = (banner: AdminBanner) => {
    setEditing(banner)
    setForm({ ...banner })
    setDesktopFile(null)
    setMobileFile(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyBanner)
    setDesktopFile(null)
    setMobileFile(null)
  }

  const handleSave = () => {
    const desktopUrl = desktopFile ? URL.createObjectURL(desktopFile) : form.desktop_url
    const mobileUrl = mobileFile ? URL.createObjectURL(mobileFile) : form.mobile_url
    const payload = { ...form, desktop_url: desktopUrl, mobile_url: mobileUrl }

    if (editing) {
      setBanners((prev) => prev.map((b) => (b.id === editing.id ? { ...payload, id: editing.id } : b)))
    } else {
      const newBanner: AdminBanner = { ...payload, id: Math.random().toString(36).slice(2), created_at: new Date().toISOString() }
      setBanners((prev) => [...prev, newBanner].sort((a, b) => a.priority - b.priority))
    }
    closeDrawer()
  }

  const move = (id: string, direction: "up" | "down") => {
    setBanners((prev) => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority)
      const idx = sorted.findIndex((b) => b.id === id)
      if (idx === -1) return prev
      const swapIdx = direction === "up" ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev
      const temp = sorted[idx]
      sorted[idx] = sorted[swapIdx]
      sorted[swapIdx] = temp
      return sorted.map((b, i) => ({ ...b, priority: i + 1 }))
    })
  }

  const toggleStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : b))
    )
  }

  const handleDelete = () => {
    if (deleteId) {
      setBanners((prev) => prev.filter((b) => b.id !== deleteId).map((b, i) => ({ ...b, priority: i + 1 })))
      setDeleteId(null)
    }
  }

  const updateForm = (field: keyof AdminBanner, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Banners</h1>
          <p className="mt-1 text-sm text-slate-500">Manage homepage banners, scheduling, and ordering.</p>
        </div>
        <Button onClick={openAdd} className="rounded-full px-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput placeholder="Search banners..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          className="md:w-44"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((banner, index) => (
              <tr key={banner.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  {banner.desktop_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.desktop_url} alt="" className="h-12 w-24 rounded-lg object-cover" />
                    </>
                  ) : (
                    <div className="flex h-12 w-24 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{banner.title}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{banner.priority}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {banner.start_date} → {banner.end_date}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "cursor-pointer",
                      banner.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                    onClick={() => toggleStatus(banner.id)}
                  >
                    {banner.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => move(banner.id, "up")} disabled={index === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => move(banner.id, "down")} disabled={index === filtered.length - 1}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(banner)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-rose-600" onClick={() => setDeleteId(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? "Edit Banner" : "Add Banner"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Banner"}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Title" value={form.title} onChange={(v) => updateForm("title", v)} />
          <Field label="Link" value={form.link} onChange={(v) => updateForm("link", v)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Desktop Banner</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-slate-500 hover:bg-slate-50">
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">{desktopFile ? desktopFile.name : form.desktop_url ? "Replace" : "Upload desktop"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setDesktopFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="space-y-2">
              <Label>Mobile Banner</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-slate-500 hover:bg-slate-50">
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">{mobileFile ? mobileFile.name : form.mobile_url ? "Replace" : "Upload mobile"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setMobileFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input id="priority" type="number" value={form.priority} onChange={(e) => updateForm("priority", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input id="start" type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input id="end" type="date" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <FilterSelect
              id="status"
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value as BannerStatus)}
              options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]}
            />
          </div>
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Banner"
        description="Are you sure you want to delete this banner?"
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
