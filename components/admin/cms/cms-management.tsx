"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { initialSiteContent, SiteContent, ContentSection, sectionLabels } from "./data"
import { Save, Plus, X } from "lucide-react"

export function CmsManagement() {
  const [content, setContent] = React.useState<SiteContent>(initialSiteContent)
  const [section, setSection] = React.useState<ContentSection>("hero")

  const setField = (sec: keyof SiteContent, key: string, value: unknown) => {
    setContent((c) => ({ ...c, [sec]: { ...(c[sec] as Record<string, unknown>), [key]: value } }))
  }

  const setArray = (sec: "features" | "testimonials" | "faq", items: unknown) => {
    setContent((c) => ({ ...c, [sec]: items }))
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Website CMS</h1>
          <p className="mt-1 text-sm text-slate-500">Manage website content and marketing sections.</p>
        </div>
        <Button className="rounded-full px-4">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:w-64">
          <FilterSelect
            value={section}
            onChange={(e) => setSection(e.target.value as ContentSection)}
            options={sectionLabels}
          />
        </div>

        <Card className="flex-1 rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold capitalize">{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {section === "hero" && (
              <>
                <Field label="Title" value={content.hero.title} onChange={(v) => setField("hero", "title", v)} />
                <Field label="Subtitle" value={content.hero.subtitle} onChange={(v) => setField("hero", "subtitle", v)} />
                <Field label="CTA Label" value={content.hero.cta_label} onChange={(v) => setField("hero", "cta_label", v)} />
                <Field label="CTA Link" value={content.hero.cta_link} onChange={(v) => setField("hero", "cta_link", v)} />
              </>
            )}

            {section === "about" && (
              <div className="space-y-2">
                <Label>About Text</Label>
                <Textarea
                  rows={6}
                  value={content.about}
                  onChange={(e) => setContent((c) => ({ ...c, about: e.target.value }))}
                />
              </div>
            )}

            {section === "contact" && (
              <>
                <Field label="Phone" value={content.contact.phone} onChange={(v) => setField("contact", "phone", v)} />
                <Field label="Email" value={content.contact.email} onChange={(v) => setField("contact", "email", v)} />
                <Field label="WhatsApp" value={content.contact.whatsapp} onChange={(v) => setField("contact", "whatsapp", v)} />
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={content.contact.address}
                    onChange={(e) => setField("contact", "address", e.target.value)}
                  />
                </div>
              </>
            )}

            {section === "seo" && (
              <>
                <Field label="Meta Title" value={content.seo.title} onChange={(v) => setField("seo", "title", v)} />
                <Field label="Meta Description" value={content.seo.description} onChange={(v) => setField("seo", "description", v)} />
                <Field label="Keywords" value={content.seo.keywords} onChange={(v) => setField("seo", "keywords", v)} />
              </>
            )}

            {section === "social" && (
              <>
                <Field label="Facebook" value={content.social.facebook} onChange={(v) => setField("social", "facebook", v)} />
                <Field label="Instagram" value={content.social.instagram} onChange={(v) => setField("social", "instagram", v)} />
                <Field label="Twitter" value={content.social.twitter} onChange={(v) => setField("social", "twitter", v)} />
                <Field label="LinkedIn" value={content.social.linkedin} onChange={(v) => setField("social", "linkedin", v)} />
                <Field label="YouTube" value={content.social.youtube} onChange={(v) => setField("social", "youtube", v)} />
              </>
            )}

            {section === "features" && (
              <ListEditor
                items={content.features}
                onChange={(items) => setArray("features", items)}
                addLabel="Add Feature"
                render={(item, i, update) => (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input value={item.title} onChange={(e) => update(i, { ...item, title: e.target.value })} placeholder="Title" />
                    <Input value={item.icon} onChange={(e) => update(i, { ...item, icon: e.target.value })} placeholder="Icon" />
                    <Input value={item.description} onChange={(e) => update(i, { ...item, description: e.target.value })} placeholder="Description" />
                  </div>
                )}
                create={() => ({ id: Math.random().toString(36).slice(2), title: "", description: "", icon: "star" })}
              />
            )}

            {section === "testimonials" && (
              <ListEditor
                items={content.testimonials}
                onChange={(items) => setArray("testimonials", items)}
                addLabel="Add Testimonial"
                render={(item, i, update) => (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input value={item.name} onChange={(e) => update(i, { ...item, name: e.target.value })} placeholder="Name" />
                      <Input value={item.role} onChange={(e) => update(i, { ...item, role: e.target.value })} placeholder="Role" />
                    </div>
                    <Textarea value={item.text} onChange={(e) => update(i, { ...item, text: e.target.value })} placeholder="Testimonial text" />
                  </div>
                )}
                create={() => ({ id: Math.random().toString(36).slice(2), name: "", role: "", text: "" })}
              />
            )}

            {section === "faq" && (
              <ListEditor
                items={content.faq}
                onChange={(items) => setArray("faq", items)}
                addLabel="Add FAQ"
                render={(item, i, update) => (
                  <div className="space-y-3">
                    <Input value={item.question} onChange={(e) => update(i, { ...item, question: e.target.value })} placeholder="Question" />
                    <Textarea value={item.answer} onChange={(e) => update(i, { ...item, answer: e.target.value })} placeholder="Answer" />
                  </div>
                )}
                create={() => ({ id: Math.random().toString(36).slice(2), question: "", answer: "" })}
              />
            )}

            {section === "footer" && (
              <>
                <Field label="Copyright" value={content.footer.copyright} onChange={(v) => setField("footer", "copyright", v)} />
                <ListEditor
                  items={content.footer.links}
                  onChange={(links) => setField("footer", "links", links)}
                  addLabel="Add Footer Link"
                  render={(item, i, update) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input value={item.label} onChange={(e) => update(i, { ...item, label: e.target.value })} placeholder="Label" />
                      <Input value={item.href} onChange={(e) => update(i, { ...item, href: e.target.value })} placeholder="URL" />
                    </div>
                  )}
                  create={() => ({ label: "", href: "" })}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
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

interface ListEditorProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  addLabel: string
  render: (item: T, index: number, update: (index: number, value: T) => void) => React.ReactNode
  create: () => T
}

function ListEditor<T>({ items, onChange, addLabel, render, create }: ListEditorProps<T>) {
  const update = (index: number, value: T) => {
    const next = [...items]
    next[index] = value
    onChange(next)
  }

  const remove = (index: number) => {
    const next = [...items]
    next.splice(index, 1)
    onChange(next)
  }

  const add = () => {
    onChange([...items, create()])
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <button
            onClick={() => remove(index)}
            className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
          {render(item, index, update)}
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add}>
        <Plus className="mr-2 h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  )
}
