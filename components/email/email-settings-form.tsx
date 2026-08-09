"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getEmailSettings, saveEmailSettings } from "@/lib/email/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Save } from "lucide-react"

export function EmailSettingsForm() {
  const [settings, setSettings] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getEmailSettings()
      setSettings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      await saveEmailSettings(settings)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <form onSubmit={save} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Sender Name</label>
          <Input value={settings.sender_name} onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Sender Email</label>
          <Input type="email" value={settings.sender_email} onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Reply-To</label>
          <Input type="email" value={settings.reply_to || ""} onChange={(e) => setSettings({ ...settings, reply_to: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Provider</label>
          <select
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-900"
            value={settings.provider}
            onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
          >
            <option value="resend">Resend</option>
            <option value="ses">AWS SES</option>
            <option value="sendgrid">SendGrid</option>
            <option value="smtp">SMTP</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Company Logo URL</label>
          <Input value={settings.company_logo || ""} onChange={(e) => setSettings({ ...settings, company_logo: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Footer Content</label>
          <Input value={settings.footer_content || ""} onChange={(e) => setSettings({ ...settings, footer_content: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Primary Color</label>
          <Input type="color" value={settings.primary_color || "#f97316"} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Secondary Color</label>
          <Input type="color" value={settings.secondary_color || "#1e293b"} onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm text-slate-700">Enable email sending</span>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </form>
  )
}
