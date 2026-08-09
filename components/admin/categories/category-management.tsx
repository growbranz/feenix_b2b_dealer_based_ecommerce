"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { createClient } from "@/lib/supabase/client"
import { AdminCategory, CategoryStatus, generateSlug } from "./data"
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

const emptyCategory: AdminCategory = {
  id: "",
  name: "",
  slug: "",
  description: "",
  status: "ACTIVE",
  parent_id: null,
  icon_url: null,
  image_url: null,
  meta_title: "",
  meta_description: "",
  display_order: 0,
  created_at: new Date().toISOString(),
}

export function CategoryManagement() {
  const [categories, setCategories] = React.useState<AdminCategory[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminCategory | null>(null)
  const [form, setForm] = React.useState<AdminCategory>(emptyCategory)
  const [iconFile, setIconFile] = React.useState<File | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadCategories = React.useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error loading categories:", error)
      alert(error.message)
    } else {
      const rows: AdminCategory[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        status: c.status,
        parent_id: c.parent_id ?? null,
        icon_url: c.icon_url ?? null,
        image_url: c.image ?? null,
        meta_title: c.meta_title ?? "",
        meta_description: c.meta_description ?? "",
        display_order: c.display_order ?? 0,
        created_at: c.created_at,
      }))
      setCategories(rows)
    }
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const parentOptions = React.useMemo(
    () => [
      { value: "", label: "No Parent" },
      ...categories
        .filter((c) => !editing || c.id !== editing.id)
        .map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories, editing]
  )

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return categories
      .filter((c) => {
        const matchesSearch =
          !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
        const matchesStatus = statusFilter === "all" || c.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => a.display_order - b.display_order)
  }, [categories, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyCategory)
    setIconFile(null)
    setImageFile(null)
    setDrawerOpen(true)
  }

  const openEdit = (category: AdminCategory) => {
    setEditing(category)
    setForm({ ...category })
    setIconFile(null)
    setImageFile(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyCategory)
    setIconFile(null)
    setImageFile(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description || null,
        image: form.image_url || null,
        status: form.status,
      }

      if (editing) {
        const { error } = await (supabase.from("categories") as any).update(payload).eq("id", editing.id)
        if (error) throw error
      } else {
        const { error } = await (supabase.from("categories") as any).insert([payload])
        if (error) throw error
      }
      await loadCategories()
      closeDrawer()
    } catch (error: any) {
      console.error("Save error:", error)
      alert(error?.message || "Failed to save category")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (id: string) => {
    const category = categories.find((c) => c.id === id)
    if (!category) return
    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      const supabase = createClient()
      const { error } = await (supabase.from("categories") as any).update({ status: newStatus }).eq("id", id)
      if (error) throw error
      await loadCategories()
    } catch (error: any) {
      console.error("Toggle status error:", error)
      alert(error?.message || "Failed to update status")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("categories").delete().eq("id", deleteId)
      if (error) throw error
      setDeleteId(null)
      await loadCategories()
    } catch (error: any) {
      console.error("Delete error:", error)
      alert(error?.message || "Failed to delete category")
    }
  }

  const updateForm = (field: keyof AdminCategory, value: string | number | null) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (field === "name" && !form.slug && !editing) {
      setForm((f) => ({ ...f, slug: generateSlug(value as string) }))
    }
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage product categories and subcategories.</p>
        </div>
        <Button onClick={openAdd} className="rounded-full px-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          className="md:w-48"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Parent</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((category) => {
              const parent = categories.find((c) => c.id === category.parent_id)
              return (
                <tr key={category.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{category.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{category.slug}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{parent?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "cursor-pointer",
                        category.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                      onClick={() => toggleStatus(category.id)}
                    >
                      {category.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{category.display_order}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-rose-600 hover:text-rose-700"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginated.length} of {filtered.length} categories
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AdminDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Category"}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <FilterSelect
                id="parent"
                value={form.parent_id || ""}
                onChange={(e) => updateForm("parent_id", e.target.value || null)}
                options={parentOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <FilterSelect
                id="status"
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value as CategoryStatus)}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              value={form.display_order}
              onChange={(e) => updateForm("display_order", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Icon Upload</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 text-slate-500 hover:bg-slate-50">
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">{iconFile ? iconFile.name : "Choose icon"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="space-y-2">
              <Label>Image Upload</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 text-slate-500 hover:bg-slate-50">
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">{imageFile ? imageFile.name : "Choose image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input id="meta_title" value={form.meta_title} onChange={(e) => updateForm("meta_title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={form.meta_description}
              onChange={(e) => updateForm("meta_description", e.target.value)}
            />
          </div>
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}
