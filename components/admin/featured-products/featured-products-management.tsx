"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterSelect } from "@/components/admin/shared/filter-select"
import { SearchInput } from "@/components/admin/shared/search-input"
import { mockProducts } from "@/components/admin/products/data"
import { mockCategories } from "@/components/admin/categories/data"
import { mockBrands } from "@/components/admin/brands/data"
import { initialFeaturedConfig, FeaturedConfig, FeaturedTab, tabLabels } from "./data"
import { Save } from "lucide-react"

export function FeaturedProductsManagement() {
  const [config, setConfig] = React.useState<FeaturedConfig>(initialFeaturedConfig)
  const [tab, setTab] = React.useState<FeaturedTab>("products")
  const [search, setSearch] = React.useState("")

  const toggleId = (key: "product_ids" | "category_ids" | "brand_ids" | "trending_ids", id: string) => {
    setConfig((c) => {
      const set = new Set(c[key])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...c, [key]: Array.from(set) }
    })
  }

  const toggleSection = (key: keyof FeaturedConfig["home_sections"]) => {
    setConfig((c) => ({ ...c, home_sections: { ...c.home_sections, [key]: !c.home_sections[key] } }))
  }

  const q = search.trim().toLowerCase()

  const renderSelection = (
    key: "product_ids" | "category_ids" | "brand_ids" | "trending_ids",
    items: { id: string; label: string }[]
  ) => {
    const filtered = items.filter((i) => i.label.toLowerCase().includes(q))
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Checkbox
              checked={config[key].includes(item.id)}
              onCheckedChange={() => toggleId(key, item.id)}
            />
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </label>
        ))}
      </div>
    )
  }

  const productItems = mockProducts.map((p) => ({ id: p.id, label: p.title }))
  const categoryItems = mockCategories.map((c) => ({ id: c.id, label: c.name }))
  const brandItems = mockBrands.map((b) => ({ id: b.id, label: b.name }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured Products</h1>
          <p className="mt-1 text-sm text-slate-500">Curate homepage featured products, categories, brands, and sections.</p>
        </div>
        <Button className="rounded-full px-4">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:w-64">
          <FilterSelect
            value={tab}
            onChange={(e) => { setTab(e.target.value as FeaturedTab); setSearch("") }}
            options={tabLabels}
          />
        </div>

        <Card className="flex-1 rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{tabLabels.find((t) => t.value === tab)?.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {tab !== "sections" && (
              <div className="mb-4">
                <SearchInput
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            {tab === "products" && renderSelection("product_ids", productItems)}
            {tab === "categories" && renderSelection("category_ids", categoryItems)}
            {tab === "brands" && renderSelection("brand_ids", brandItems)}
            {tab === "trending" && renderSelection("trending_ids", productItems)}

            {tab === "sections" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(config.home_sections).map(([key, enabled]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <span className="text-sm font-medium capitalize text-slate-700">{key.replace(/_/g, " ")}</span>
                    <Checkbox checked={enabled} onCheckedChange={() => toggleSection(key as keyof FeaturedConfig["home_sections"])} />
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
