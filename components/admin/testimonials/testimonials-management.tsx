"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { EmptyState } from "@/components/shared/empty-state"
import { Select } from "@/components/ui/select"
import {
  getTestimonialsAction,
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
  toggleTestimonialStatusAction,
} from "@/lib/testimonials/actions"
import type { Testimonial } from "@/types"
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2, RotateCcw, MessageSquareQuote, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const emptyTestimonial: Omit<Testimonial, "id" | "created_at" | "updated_at"> = {
  customer_name: "",
  customer_role: null,
  company_name: null,
  testimonial_text: "",
  avatar_url: null,
  rating: 5,
  display_order: 0,
  is_active: true,
}

export function TestimonialsManagement() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Testimonial | null>(null)
  const [form, setForm] = React.useState<Omit<Testimonial, "id" | "created_at" | "updated_at">>(emptyTestimonial)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadTestimonials = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTestimonialsAction()
      setTestimonials(data)
    } catch (e: any) {
      setError(e.message || "Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadTestimonials()
  }, [loadTestimonials])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyTestimonial, display_order: testimonials.length + 1 })
    setDrawerOpen(true)
  }

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial)
    setForm(testimonial)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(emptyTestimonial)
  }

  const handleSave = async () => {
    if (!form.customer_name || !form.testimonial_text) {
      setError("Customer name and testimonial text are required")
      return
    }

    if (form.rating < 1 || form.rating > 5) {
      setError("Rating must be between 1 and 5")
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateTestimonialAction(editing.id, form)
      } else {
        await createTestimonialAction(form)
      }
      await loadTestimonials()
      closeDrawer()
    } catch (e: any) {
      const errorMessage = e?.message || "Unable to save testimonial. Please check your database configuration."
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const move = async (id: string, direction: "up" | "down") => {
    const sorted = [...testimonials].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((t) => t.id === id)
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    
    const temp = sorted[idx]
    sorted[idx] = sorted[swapIdx]
    sorted[swapIdx] = temp
    
    const reordered = sorted.map((t, i) => ({ ...t, display_order: i + 1 }))
    const testimonialIds = reordered.map((t) => t.id)
    
    try {
      await reorderTestimonialsAction(testimonialIds)
      await loadTestimonials()
    } catch (e: any) {
      setError(e.message || "Failed to reorder testimonials")
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleTestimonialStatusAction(id)
      await loadTestimonials()
    } catch (e: any) {
      setError(e.message || "Failed to update testimonial status")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteTestimonialAction(deleteId)
      setDeleteId(null)
      await loadTestimonials()
    } catch (e: any) {
      setError(e.message || "Failed to delete testimonial")
    }
  }

  const updateForm = (field: keyof Omit<Testimonial, "id" | "created_at" | "updated_at">, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Testimonials</h1>
          <p className="mt-1 text-sm text-slate-500">Manage customer testimonials displayed on the public website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadTestimonials} disabled={loading}>
            <RotateCcw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button onClick={openAdd} className="rounded-full px-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={itemVariants} className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </motion.div>
      ) : testimonials.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No testimonials yet"
            description="Create your first customer testimonial to appear on the public website."
            icon={MessageSquareQuote}
            action={<Button onClick={openAdd}>Add Testimonial</Button>}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Testimonial</th>
                  <th className="px-5 py-3.5">Rating</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {testimonials.map((testimonial, idx) => (
                  <tr key={testimonial.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                          {testimonial.avatar_url ? (
                            <img
                              src={testimonial.avatar_url}
                              alt={testimonial.customer_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(testimonial.customer_name)
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{testimonial.customer_name}</div>
                          <div className="text-xs text-slate-500">
                            {testimonial.customer_role && <span>{testimonial.customer_role}</span>}
                            {testimonial.customer_role && testimonial.company_name && <span> · </span>}
                            {testimonial.company_name && <span>{testimonial.company_name}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="truncate text-slate-600" title={testimonial.testimonial_text}>
                        {testimonial.testimonial_text}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < testimonial.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            )}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{testimonial.display_order}</td>
                    <td className="px-5 py-4">
                      <Badge
                        className={cn(
                          "border cursor-pointer",
                          testimonial.is_active
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        )}
                        onClick={() => handleToggleStatus(testimonial.id)}
                      >
                        {testimonial.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => move(testimonial.id, "up")}
                          disabled={idx === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => move(testimonial.id, "down")}
                          disabled={idx === testimonials.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openEdit(testimonial)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-rose-600"
                          onClick={() => setDeleteId(testimonial.id)}
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
        title={editing ? "Edit Testimonial" : "Add Testimonial"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDrawer} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Testimonial"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name *</Label>
            <Input
              id="customer_name"
              value={form.customer_name}
              onChange={(e) => updateForm("customer_name", e.target.value)}
              placeholder="e.g., Rahul Sharma"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_role">Customer Role</Label>
            <Input
              id="customer_role"
              value={form.customer_role || ""}
              onChange={(e) => updateForm("customer_role", e.target.value)}
              placeholder="e.g., Founder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={form.company_name || ""}
              onChange={(e) => updateForm("company_name", e.target.value)}
              placeholder="e.g., TechFix Mobile Solutions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial_text">Testimonial *</Label>
            <Textarea
              id="testimonial_text"
              value={form.testimonial_text}
              onChange={(e) => updateForm("testimonial_text", e.target.value)}
              placeholder="Enter the customer testimonial..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              value={form.avatar_url || ""}
              onChange={(e) => updateForm("avatar_url", e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-slate-500">Optional. If not provided, initials will be used.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Select
              id="rating"
              value={form.rating.toString()}
              onChange={(e) => updateForm("rating", Number(e.target.value))}
              className="rounded-xl"
            >
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
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
                min="0"
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
        title="Delete Testimonial"
        description="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </motion.div>
  )
}
