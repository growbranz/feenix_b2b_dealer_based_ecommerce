"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSettings, saveSettings, type SettingsData } from "@/lib/settings/actions"
import { Building2, Mail, Phone, MessageSquare, Globe, Save, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type SettingsSection = "company" | "contact" | "social" | "website"

const sections: { value: SettingsSection; label: string; icon: any }[] = [
  { value: "company", label: "Company Information", icon: Building2 },
  { value: "contact", label: "Contact & Support", icon: Phone },
  { value: "social", label: "Social Links", icon: Globe },
  { value: "website", label: "Website Settings", icon: MessageSquare },
]

export function SettingsPage() {
  const [settings, setSettings] = React.useState<SettingsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<SettingsSection>("company")
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (err) {
      setError("Failed to load settings")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await saveSettings(settings)
      setSuccessMessage("Settings saved successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
      // Reload settings to ensure we have the latest data
      await loadSettings()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings"
      setError(errorMessage)
      console.error("Settings save error:", err)
    } finally {
      setSaving(false)
    }
  }

  function updateSetting<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSettings(prev => prev ? { ...prev, [key]: value } : null)
  }

  if (loading) {
    return <SettingsSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Error loading settings</h3>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button onClick={loadSettings} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    )
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
          <p className="mt-1 text-sm text-slate-500">Manage your platform configuration and business details.</p>
        </div>
        <div className="flex items-center gap-3">
          {successMessage && (
            <div className="text-sm text-green-600">
              {successMessage}
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="rounded-full px-6"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navigation Sidebar */}
        <div className="lg:w-64">
          <Card className="border-slate-200">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.value}
                      onClick={() => setActiveSection(section.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        activeSection === section.value
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Form */}
        <div className="flex-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {sections.find(s => s.value === activeSection)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {activeSection === "company" && (
                  <CompanySection settings={settings} updateSetting={updateSetting} />
                )}
                {activeSection === "contact" && (
                  <ContactSection settings={settings} updateSetting={updateSetting} />
                )}
                {activeSection === "social" && (
                  <SocialSection settings={settings} updateSetting={updateSetting} />
                )}
                {activeSection === "website" && (
                  <WebsiteSection settings={settings} updateSetting={updateSetting} />
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function CompanySection({ settings, updateSetting }: { settings: SettingsData | null; updateSetting: any }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={settings?.company_name || ""}
            onChange={(e) => updateSetting("company_name", e.target.value)}
            placeholder="Feenix Repair"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_email">Company Email</Label>
          <Input
            id="company_email"
            type="email"
            value={settings?.company_email || ""}
            onChange={(e) => updateSetting("company_email", e.target.value)}
            placeholder="info@feenixrepair.com"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_phone">Company Phone</Label>
          <Input
            id="company_phone"
            value={settings?.company_phone || ""}
            onChange={(e) => updateSetting("company_phone", e.target.value)}
            placeholder="+91 1800 123 4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gst_number">GST Number</Label>
          <Input
            id="gst_number"
            value={settings?.gst_number || ""}
            onChange={(e) => updateSetting("gst_number", e.target.value)}
            placeholder="07AABCU9607R1ZN"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="company_address">Company Address</Label>
        <Textarea
          id="company_address"
          value={settings?.company_address || ""}
          onChange={(e) => updateSetting("company_address", e.target.value)}
          placeholder="123 Industrial Area, Phase 1"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo_url">Logo URL</Label>
        <Input
          id="logo_url"
          value={settings?.logo_url || ""}
          onChange={(e) => updateSetting("logo_url", e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </div>
    </div>
  )
}

function ContactSection({ settings, updateSetting }: { settings: SettingsData | null; updateSetting: any }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="support_email">Support Email</Label>
          <Input
            id="support_email"
            type="email"
            value={settings?.support_email || ""}
            onChange={(e) => updateSetting("support_email", e.target.value)}
            placeholder="support@feenixrepair.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support_phone">Support Phone</Label>
          <Input
            id="support_phone"
            value={settings?.support_phone || ""}
            onChange={(e) => updateSetting("support_phone", e.target.value)}
            placeholder="+91 1800 123 4567"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
        <Input
          id="whatsapp_number"
          value={settings?.whatsapp_number || ""}
          onChange={(e) => updateSetting("whatsapp_number", e.target.value)}
          placeholder="+91 98765 43210"
        />
      </div>
    </div>
  )
}

function SocialSection({ settings, updateSetting }: { settings: SettingsData | null; updateSetting: any }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="facebook_url">Facebook URL</Label>
        <Input
          id="facebook_url"
          value={settings?.facebook_url || ""}
          onChange={(e) => updateSetting("facebook_url", e.target.value)}
          placeholder="https://facebook.com/feenixrepair"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instagram_url">Instagram URL</Label>
        <Input
          id="instagram_url"
          value={settings?.instagram_url || ""}
          onChange={(e) => updateSetting("instagram_url", e.target.value)}
          placeholder="https://instagram.com/feenixrepair"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          id="linkedin_url"
          value={settings?.linkedin_url || ""}
          onChange={(e) => updateSetting("linkedin_url", e.target.value)}
          placeholder="https://linkedin.com/company/feenixrepair"
        />
      </div>
    </div>
  )
}

function WebsiteSection({ settings, updateSetting }: { settings: SettingsData | null; updateSetting: any }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site_name">Site Name</Label>
        <Input
          id="site_name"
          value={settings?.site_name || ""}
          onChange={(e) => updateSetting("site_name", e.target.value)}
          placeholder="Feenix Repair"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo_title">Default SEO Title</Label>
        <Input
          id="seo_title"
          value={settings?.seo_title || ""}
          onChange={(e) => updateSetting("seo_title", e.target.value)}
          placeholder="Feenix Repair - Premium Mobile Repair Parts"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo_description">Default SEO Description</Label>
        <Textarea
          id="seo_description"
          value={settings?.seo_description || ""}
          onChange={(e) => updateSetting("seo_description", e.target.value)}
          placeholder="Your trusted source for quality mobile repair parts and accessories."
          rows={3}
        />
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-6">
        <div className="w-64">
          <Card>
            <CardContent className="p-2">
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
