"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { initialSettings, AdminSettings, SettingsSection, settingsSectionLabels } from "./data"
import { Save } from "lucide-react"

export function SettingsManagement() {
  const [settings, setSettings] = React.useState<AdminSettings>(initialSettings)
  const [section, setSection] = React.useState<SettingsSection>("company")

  const setField = (sec: keyof AdminSettings, key: string, value: unknown) => {
    setSettings((s) => ({ ...s, [sec]: { ...(s[sec] as Record<string, unknown>), [key]: value } }))
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure platform, integrations, and business details.</p>
        </div>
        <Button className="rounded-full px-4">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:w-64">
          <FilterSelect
            value={section}
            onChange={(e) => setSection(e.target.value as SettingsSection)}
            options={settingsSectionLabels}
          />
        </div>

        <Card className="flex-1 rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{settingsSectionLabels.find((s) => s.value === section)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section === "company" && (
              <>
                <Field label="Site Name" value={settings.company.name} onChange={(v) => setField("company", "name", v)} />
                <Field label="Tagline" value={settings.company.tagline} onChange={(v) => setField("company", "tagline", v)} />
                <Field label="Logo URL" value={settings.company.logo_url} onChange={(v) => setField("company", "logo_url", v)} />
                <Field label="Favicon URL" value={settings.company.favicon_url} onChange={(v) => setField("company", "favicon_url", v)} />
              </>
            )}

            {section === "business" && (
              <>
                <Field label="GST Number" value={settings.business.gst} onChange={(v) => setField("business", "gst", v)} />
                <Field label="PAN" value={settings.business.pan} onChange={(v) => setField("business", "pan", v)} />
                <Field label="TAN" value={settings.business.tan} onChange={(v) => setField("business", "tan", v)} />
                <Field label="CIN" value={settings.business.cin} onChange={(v) => setField("business", "cin", v)} />
              </>
            )}

            {section === "contact" && (
              <>
                <Field label="Support Email" value={settings.contact.support_email} onChange={(v) => setField("contact", "support_email", v)} />
                <Field label="Phone" value={settings.contact.phone} onChange={(v) => setField("contact", "phone", v)} />
                <Field label="WhatsApp" value={settings.contact.whatsapp} onChange={(v) => setField("contact", "whatsapp", v)} />
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={settings.contact.address} onChange={(e) => setField("contact", "address", e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="City" value={settings.contact.city} onChange={(v) => setField("contact", "city", v)} />
                  <Field label="State" value={settings.contact.state} onChange={(v) => setField("contact", "state", v)} />
                  <Field label="Pincode" value={settings.contact.pincode} onChange={(v) => setField("contact", "pincode", v)} />
                </div>
              </>
            )}

            {section === "smtp" && (
              <>
                <Field label="Host" value={settings.smtp.host} onChange={(v) => setField("smtp", "host", v)} />
                <Field label="Port" value={settings.smtp.port} onChange={(v) => setField("smtp", "port", v)} />
                <Field label="User" value={settings.smtp.user} onChange={(v) => setField("smtp", "user", v)} />
                <Field label="Password" value={settings.smtp.password} onChange={(v) => setField("smtp", "password", v)} type="password" />
                <Field label="From Email" value={settings.smtp.from_email} onChange={(v) => setField("smtp", "from_email", v)} />
                <CheckboxField
                  label="Use Secure Connection"
                  checked={settings.smtp.secure}
                  onChange={(v) => setField("smtp", "secure", v)}
                />
              </>
            )}

            {section === "resend" && (
              <>
                <Field label="Resend API Key" value={settings.resend.api_key} onChange={(v) => setField("resend", "api_key", v)} type="password" />
                <Field label="From Email" value={settings.resend.from_email} onChange={(v) => setField("resend", "from_email", v)} />
              </>
            )}

            {section === "supabase" && (
              <>
                <Field label="Supabase URL" value={settings.supabase.url} onChange={(v) => setField("supabase", "url", v)} />
                <Field label="Anon Key" value={settings.supabase.anon_key} onChange={(v) => setField("supabase", "anon_key", v)} type="password" />
                <Field label="Service Role Key" value={settings.supabase.service_role_key} onChange={(v) => setField("supabase", "service_role_key", v)} type="password" />
              </>
            )}

            {section === "razorpay" && (
              <>
                <Field label="Key ID" value={settings.razorpay.key_id} onChange={(v) => setField("razorpay", "key_id", v)} />
                <Field label="Key Secret" value={settings.razorpay.key_secret} onChange={(v) => setField("razorpay", "key_secret", v)} type="password" />
                <Field label="Webhook Secret" value={settings.razorpay.webhook_secret} onChange={(v) => setField("razorpay", "webhook_secret", v)} type="password" />
              </>
            )}

            {section === "analytics" && (
              <>
                <Field label="Google Tracking ID" value={settings.analytics.google_tracking_id} onChange={(v) => setField("analytics", "google_tracking_id", v)} />
                <Field label="Facebook Pixel ID" value={settings.analytics.facebook_pixel_id} onChange={(v) => setField("analytics", "facebook_pixel_id", v)} />
                <Field label="Hotjar ID" value={settings.analytics.hotjar_id} onChange={(v) => setField("analytics", "hotjar_id", v)} />
              </>
            )}

            {section === "social" && (
              <>
                <Field label="Facebook" value={settings.social.facebook} onChange={(v) => setField("social", "facebook", v)} />
                <Field label="Instagram" value={settings.social.instagram} onChange={(v) => setField("social", "instagram", v)} />
                <Field label="Twitter" value={settings.social.twitter} onChange={(v) => setField("social", "twitter", v)} />
                <Field label="LinkedIn" value={settings.social.linkedin} onChange={(v) => setField("social", "linkedin", v)} />
                <Field label="YouTube" value={settings.social.youtube} onChange={(v) => setField("social", "youtube", v)} />
              </>
            )}

            {section === "theme" && (
              <>
                <Field label="Primary Color" value={settings.theme.primary_color} onChange={(v) => setField("theme", "primary_color", v)} />
                <CheckboxField label="Dark Mode" checked={settings.theme.dark_mode} onChange={(v) => setField("theme", "dark_mode", v)} />
                <CheckboxField label="Rounded Corners" checked={settings.theme.rounded_corners} onChange={(v) => setField("theme", "rounded_corners", v)} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={label} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor={label} className="cursor-pointer">
        {label}
      </Label>
    </div>
  )
}
