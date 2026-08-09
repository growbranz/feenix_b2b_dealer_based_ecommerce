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
import { AdminModel, ModelStatus, generateSlug } from "./data"
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

const emptyModel: AdminModel = {
  id: "",
  name: "",
  slug: "",
  brand_id: "",
  category_id: "",
  description: "",
  compatible_products: "",
  status: "ACTIVE",
  created_at: new Date().toISOString(),
}

export function ModelManagement() {
  const [models, setModels] = React.useState<AdminModel[]>([])
  const [brands, setBrands] = React.useState<{ id: string; name: string; category_id: string }[]>([])
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [brandFilter, setBrandFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminModel | null>(null)
  const [form, setForm] = React.useState<AdminModel>(emptyModel)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadModels = React.useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error loading models:", error)
      alert(error.message)
    } else {
      const rows: AdminModel[] = (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        brand_id: m.brand_id,
        category_id: "",
        description: "",
        compatible_products: "",
        status: m.status,
        created_at: m.created_at,
      }))
      setModels(rows)
    }
    setIsLoading(false)
  }, [])

  const loadBrands = React.useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("brands")
      .select("id, name, category_id")
      .eq("status", "ACTIVE")
      .order("name", { ascending: true })
    if (error) {
      console.error("Error loading brands:", error)
    } else {
      setBrands(data || [])
    }
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
    loadModels()
    loadBrands()
    loadCategories()
  }, [loadModels, loadBrands, loadCategories])

  const brandOptions = [{ value: "all", label: "All Brands" }, ...brands.map((b) => ({ value: b.id, label: b.name }))]
  const categoryOptions = [{ value: "all", label: "All Categories" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return models
      .filter((m) => {
        const brand = brands.find((b) => b.id === m.brand_id)
        const matchesSearch = !q || m.name.toLowerCase().includes(q)
        const matchesBrand = brandFilter === "all" || m.brand_id === brandFilter
        const matchesCategory = categoryFilter === "all" || brand?.category_id === categoryFilter
        const matchesStatus = statusFilter === "all" || m.status === statusFilter
        return matchesSearch && matchesBrand && matchesCategory && matchesStatus
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [models, search, brandFilter, categoryFilter, statusFilter, brands])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyModel)
    setDrawerOpen(true)
  }

  const openEdit = (model: AdminModel) => {
    setEditing(model)
    setForm({ ...model })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyModel)
  }

  const handleSave = async () => {
    if (!form.brand_id) {
      alert("Please select a brand.")
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      const payload = {
        brand_id: form.brand_id,
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        status: form.status,
      }

      if (editing) {
        const { error } = await (supabase.from("models") as any).update(payload).eq("id", editing.id)
        if (error) throw error
      } else {
        const { error } = await (supabase.from("models") as any).insert([payload])
        if (error) throw error
      }
      await loadModels()
      closeDrawer()
    } catch (error: any) {
      console.error("Save error:", error)
      alert(error?.message || "Failed to save model")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (id: string) => {
    const model = models.find((m) => m.id === id)
    if (!model) return
    const newStatus = model.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      const supabase = createClient()
      const { error } = await (supabase.from("models") as any).update({ status: newStatus }).eq("id", id)
      if (error) throw error
      await loadModels()
    } catch (error: any) {
      console.error("Toggle status error:", error)
      alert(error?.message || "Failed to update status")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from("models").delete().eq("id", deleteId)
      if (error) throw error
      setDeleteId(null)
      await loadModels()
    } catch (error: any) {
      console.error("Delete error:", error)
      alert(error?.message || "Failed to delete model")
    }
  }

  const updateForm = (field: keyof AdminModel, value: string | number) => {
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Models</h1>
          <p className="mt-1 text-sm text-slate-500">Manage device models and compatibility.</p>
        </div>
        <Button onClick={openAdd} className="rounded-full px-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Model
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-wrap">
        <SearchInput placeholder="Search models..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <FilterSelect value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} options={brandOptions} className="lg:w-48" />
        <FilterSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={categoryOptions} className="lg:w-48" />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "all", label: "All Status" }, { value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]}
          className="lg:w-48"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((model) => {
              const brand = brands.find((b) => b.id === model.brand_id)
              const category = categories.find((c) => c.id === brand?.category_id)
              return (
                <tr key={model.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{model.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{brand?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "cursor-pointer",
                        model.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                      onClick={() => toggleStatus(model.id)}
                    >
                      {model.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEdit(model)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-rose-600 hover:text-rose-700"
                      onClick={() => setDeleteId(model.id)}
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
          <p className="text-sm text-slate-500">Showing {paginated.length} of {filtered.length} models</p>
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
        title={editing ? "Edit Model" : "Add Model"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Save Changes" : "Create Model"}</Button>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <FilterSelect
                id="brand"
                value={form.brand_id}
                onChange={(e) => updateForm("brand_id", e.target.value)}
                options={[{ value: "", label: "Select brand" }, ...brands.map((b) => ({ value: b.id, label: b.name }))]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <FilterSelect
                id="category"
                value={form.category_id}
                onChange={(e) => updateForm("category_id", e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <FilterSelect
              id="status"
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value as ModelStatus)}
              options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compatible">Compatible Products</Label>
            <Textarea
              id="compatible"
              placeholder="e.g. iPhone 14 Pro, iPhone 14 Pro Max"
              value={form.compatible_products}
              onChange={(e) => updateForm("compatible_products", e.target.value)}
            />
          </div>
        </div>
      </AdminDrawer>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Model"
        description="Are you sure you want to delete this model? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}
