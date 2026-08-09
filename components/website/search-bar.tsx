"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = "Search products...", className }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.get('search') || '')

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set('search', query)
      } else {
        params.delete('search')
      }
      params.delete('page') // Reset to page 1 on new search
      router.push(`/products?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-24 h-12 rounded-full border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          aria-label="Search products"
        />
        <Button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all border-0" aria-label="Submit search">
          Search
        </Button>
      </div>
    </form>
  )
}
