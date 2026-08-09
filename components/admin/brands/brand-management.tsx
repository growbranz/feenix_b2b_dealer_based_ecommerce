"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { createClient } from "@/lib/supabase/client"
import { AdminBrand, BrandStatus, generateSlug } from "./data"
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Upload, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

const emptyBrand: AdminBrand = {
  id: "",
  category_id: "",
  name: "",
  slug: "",
  description: "",
  country: "",
  website: "",
  status: "ACTIVE",
  featured: false,
  logo_url: null,
  created_at: new Date().toISOString(),
}

export function BrandManagement() {
  const [brands, setBrands] = React.useState<AdminBrand[]>([])
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminBrand | null>(null)
  const [form, setForm] = React.useState<AdminBrand>(emptyBrand)
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadBrands = React.useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error loading brands:", error)
      alert(error.message)
    } else {
      const rows: AdminBrand[] = (data || []).map((b: any) => ({
        id: b.id,
        category_id: b.category_id,
        name: b.name,
        slug: b.slug,
        description: b.description ?? "",
        country: b.country ?? "",
        website: b.website ?? "",
        status: b.status,
        featured: b.featured ?? false,
        logo_url: b.logo ?? null,
        created_at: b.created_at,
      }))
      setBrands(rows)
    }
    setIsLoading(false)
  }, [])

  const loadCategories = React.useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("status", "ACTIVE")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error loading categories:", error)
    } else {
      setCategories(data || [])
    }
  }, [])

  React.useEffect(() => {
    loadBrands()
    loadCategories()
  }, [loadBrands, loadCategories])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return brands
      .filter((b) => {
        const matchesSearch = !q || b.name.toLowerCase().includes(q) || b.country.toLowerCase().includes(q)
        const matchesStatus = statusFilter === "all" || b.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [brands, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyBrand)
    setLogoFile(null)
    setDrawerOpen(true)
  }

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand)
    setForm({ ...brand })
    setLogoFile(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyBrand)
    setLogoFile(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        category_id: form.category_id,
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        logo: form.logo_url || null,
        status: form.status,
      }

      if (editing) {
        const { error } = await (supabase.from("brands") as any).update(payload).eq("id", editing.id)
        if (error) throw error
      } else {
        const { error } = await (supabase.from("brands") as any).insert([payload])
        if (error) throw error
      }
      await loadBrands()
      closeDrawer()
    } catch (error: any) {
      console.error("Save error:", error)
      alert(error?.message || "Failed to save brand")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (id: string) => {
    const brand = brands.find((b) => b.id === id)
    if (!brand) return
    const newStatus = brand.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      const supabase = createClient()
      const { error } = await (supabase.from("brands") as any).update({ status: newStatus }).eq("id", id)
      if (error) throw error
      await loadBrands()
    } catch (error: any) {
      console.error("Toggle status error:", error)
      alert(error?.message || "Failed to update status")
    }
  }

  const toggleFeatured = (id: string) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, featured: !b.featured } : b)))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("brands").delete().eq("id", deleteId)
      if (error) throw error
      setDeleteId(null)
      await loadBrands()
    } catch (error: any) {
      console.error("Delete error:", error)
      alert(error?.message || "Failed to delete brand")
    }
  }

  const updateForm = (field: keyof AdminBrand, value: string | boolean | null) => {
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Brands</h1>
          <p className="mt-1 text-sm text-slate-500">Manage device brands and manufacturers.</p>
        </div>
        <Button onClick={openAdd} className="rounded-full px-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          placeholder="Search brands..."
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Country</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Featured</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((brand) => (
              <tr key={brand.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{brand.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{brand.country}</td>
                <td className="px-4 py-3">
                  <Badge
                    className={cn(
                      "cursor-pointer",
                      brand.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                    onClick={() => toggleStatus(brand.id)}
                  >
                    {brand.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-full", brand.featured ? "text-amber-500" : "text-slate-300")}
                    onClick={() => toggleFeatured(brand.id)}
                  >
                    <Star className={cn("h-4 w-4", brand.featured && "fill-current")} />
                  </Button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(brand)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-rose-600 hover:text-rose-700"
                    onClick={() => setDeleteId(brand.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} brands</p>
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
            <span className="text-sm font-medium text-slate-600">Page {currentPage} of {pageCount}</span>
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
        title={editing ? "Edit Brand" : "Add Brand"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Brand"}</Button>
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
            <Label htmlFor="category_id">Category *</Label>
            <FilterSelect
              id="category_id"
              value={form.category_id}
              onChange={(e) => updateForm("category_id", e.target.value)}
              options={[{ value: "", label: "Select category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => updateForm("country", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website} onChange={(e) => updateForm("website", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <FilterSelect
                id="status"
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value as BrandStatus)}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="featured"
                checked={form.featured}
                onCheckedChange={(checked) => updateForm("featured", checked === true)}
              />
              <Label htmlFor="featured" className="cursor-pointer">Featured Brand</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo Upload</Label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-slate-500 hover:bg-slate-50">
              <Upload className="h-6 w-6" />
              <span className="mt-1 text-xs">{logoFile ? logoFile.name : form.logo_url ? "Replace logo" : "Choose logo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Brand"
        description="Are you sure you want to delete this brand? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}
