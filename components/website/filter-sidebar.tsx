"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export interface FilterOption {
  id: string
  label: string
  count?: number
}

export interface FilterGroup {
  id: string
  title: string
  options: FilterOption[]
}

export interface FilterSidebarProps {
  categories?: FilterGroup
  brands?: FilterGroup
  priceRange?: { min: number; max: number }
  className?: string
}

export function FilterSidebar({
  categories,
  brands,
  priceRange,
  className
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    searchParams.get('category')?.split(',') || []
  )
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(
    searchParams.get('brand')?.split(',') || []
  )
  const [price, setPrice] = React.useState<number[]>([
    Number(searchParams.get('minPrice')) || priceRange?.min || 0,
    Number(searchParams.get('maxPrice')) || priceRange?.max || 1000
  ])

  const updateURL = (updates: {
    categories?: string[]
    brands?: string[]
    price?: number[]
  }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (updates.categories !== undefined) {
      if (updates.categories.length > 0) {
        params.set('category', updates.categories.join(','))
      } else {
        params.delete('category')
      }
    }
    
    if (updates.brands !== undefined) {
      if (updates.brands.length > 0) {
        params.set('brand', updates.brands.join(','))
      } else {
        params.delete('brand')
      }
    }
    
    if (updates.price !== undefined) {
      params.set('minPrice', updates.price[0].toString())
      params.set('maxPrice', updates.price[1].toString())
    }
    
    params.delete('page') // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId]
    setSelectedCategories(newCategories)
    updateURL({ categories: newCategories })
  }

  const handleBrandToggle = (brandId: string) => {
    const newBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId]
    setSelectedBrands(newBrands)
    updateURL({ brands: newBrands })
  }

  const handlePriceChange = (newPrice: number[]) => {
    setPrice(newPrice)
    updateURL({ price: newPrice })
  }

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPrice([priceRange?.min || 0, priceRange?.max || 1000])
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('brand')
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <aside className={className}>
      <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)] sticky top-28">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-bold">Filters</CardTitle>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 rounded-full" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {categories && (
            <div className="space-y-3">
              <h3 className="font-semibold">{categories.title}</h3>
              <div className="space-y-2">
                {categories.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${option.id}`}
                      checked={selectedCategories.includes(option.id)}
                      onCheckedChange={() => handleCategoryToggle(option.id)}
                    />
                    <Label
                      htmlFor={`category-${option.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.count && (
                      <span className="text-xs text-slate-500">
                        ({option.count})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {brands && (
            <div className="space-y-3">
              <h3 className="font-semibold">{brands.title}</h3>
              <div className="space-y-2">
                {brands.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${option.id}`}
                      checked={selectedBrands.includes(option.id)}
                      onCheckedChange={() => handleBrandToggle(option.id)}
                    />
                    <Label
                      htmlFor={`brand-${option.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    {option.count && (
                      <span className="text-xs text-slate-500">
                        ({option.count})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {priceRange && (
            <div className="space-y-3">
              <h3 className="font-semibold">Price Range</h3>
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                value={price}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>${price[0]}</span>
                <span>${price[1]}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
