"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getEmailTemplates, saveEmailTemplate, deleteEmailTemplate, sendTestEmail } from "@/lib/email/actions"
import { Textarea } from "@/components/ui/textarea"
import { compileTemplate } from "@/lib/email/templates"
import { Plus, Save, Trash, Mail } from "lucide-react"

const defaultTemplates = [
  { key: "welcome", name: "Welcome Email" },
  { key: "email-verification", name: "Email Verification" },
  { key: "password-reset", name: "Password Reset" },
  { key: "dealer-approved", name: "Dealer Approved" },
  { key: "dealer-rejected", name: "Dealer Rejected" },
  { key: "customer-registration", name: "Customer Registration" },
  { key: "order-created", name: "Order Created" },
  { key: "order-confirmed", name: "Order Confirmed" },
  { key: "order-shipped", name: "Order Shipped" },
  { key: "order-delivered", name: "Order Delivered" },
  { key: "invoice-generated", name: "Invoice Generated" },
  { key: "payment-success", name: "Payment Success" },
  { key: "payment-failed", name: "Payment Failed" },
  { key: "refund-completed", name: "Refund Completed" },
  { key: "enquiry-assigned", name: "Enquiry Assigned" },
  { key: "quotation-sent", name: "Quotation Sent" },
  { key: "inventory-low", name: "Inventory Low Stock" },
]

export function TemplateManager() {
  const [templates, setTemplates] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [selected, setSelected] = React.useState<any>(null)
  const [testEmail, setTestEmail] = React.useState("")
  const [preview, setPreview] = React.useState({ subject: "", html: "" })

  async function load() {
    setLoading(true)
    try {
      const data = await getEmailTemplates()
      const map = new Map(data.map((t: any) => [t.key, t]))
      const merged = defaultTemplates.map((d) => {
        const existing = map.get(d.key)
        return existing || { key: d.key, name: d.name, subject: "", html: "", is_active: true }
      })
      setTemplates(merged)
      setSelected(merged[0])
      updatePreview(merged[0])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  function updatePreview(t: any) {
    const compiled = compileTemplate(t?.key || "notification", { name: "Test User", orderNumber: "ORD-123", amount: 999, link: "#" })
    setPreview({ subject: compiled.subject, html: compiled.html })
  }

  function selectTemplate(key: string) {
    const t = templates.find((x) => x.key === key)
    if (t) {
      setSelected(t)
      updatePreview(t)
    }
  }

  function updateSelected(partial: any) {
    setSelected({ ...selected, ...partial })
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    try {
      await saveEmailTemplate({ ...selected, name: selected.name || selected.key })
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!selected?.id) return
    if (!confirm("Delete template?")) return
    await deleteEmailTemplate(selected.id)
    await load()
  }

  async function test() {
    if (!testEmail || !selected) return
    const data: any = { name: "Test User", orderNumber: "ORD-123", amount: 999, link: "#" }
    await sendTestEmail({ to: testEmail, template: selected.key, data })
    alert("Test email sent")
  }

  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold">Templates</h3>
        <div className="max-h-96 space-y-1 overflow-y-auto">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => selectTemplate(t.key)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${selected?.key === t.key ? "bg-orange-50 text-orange-700" : "hover:bg-slate-50"}`}
            >
              {t.name} {t.id && <span className="ml-2 text-xs text-slate-400">saved</span>}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Edit {selected.name}</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                {selected.id && (
                  <Button size="sm" variant="outline" onClick={remove}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Subject</label>
                <Input value={selected.subject} onChange={(e) => updateSelected({ subject: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">HTML Body</label>
                <Textarea value={selected.html} onChange={(e) => updateSelected({ html: e.target.value })} rows={12} />
              </div>
              <div className="flex gap-2">
                <Input placeholder="test@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                <Button variant="outline" onClick={test}>
                  <Mail className="mr-2 h-4 w-4" />
                  Test
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
            <h3 className="mb-2 text-sm font-semibold">Preview: {preview.subject}</h3>
            <div className="max-h-64 overflow-y-auto rounded border bg-slate-50 p-3 text-xs" dangerouslySetInnerHTML={{ __html: preview.html }} />
          </div>
        </div>
      )}
    </div>
  )
}
