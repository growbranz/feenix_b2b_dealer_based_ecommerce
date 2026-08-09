"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Eye, Pencil, Package, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { recentProducts } from "./data"
import type { RecentProduct, RecentProductStatus } from "./types"

const statusVariant = (status: RecentProductStatus) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
    case "INACTIVE":
      return "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20"
    case "OUT_OF_STOCK":
      return "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
    case "PENDING":
      return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const statusLabel = (status: RecentProductStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())

export function RecentProductsTable() {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const limit = 5

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recentProducts
    return recentProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [search])

  const totalPages = Math.ceil(filtered.length / limit) || 1
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  React.useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <Card className="rounded-2xl border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Recent Products</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-full border-border/50 bg-muted/50 pl-9 pr-4 ring-offset-0 focus-visible:ring-1"
            />
          </div>
        </CardHeader>
        <CardContent>
          {paginated.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your search or add a new product."
            />
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="py-3 pr-4 font-medium">Image</th>
                      <th className="py-3 pr-4 font-medium">Product</th>
                      <th className="py-3 pr-4 font-medium">Brand</th>
                      <th className="py-3 pr-4 font-medium">Model</th>
                      <th className="py-3 pr-4 font-medium">Category</th>
                      <th className="py-3 pr-4 font-medium">Stock</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((product, index) => (
                      <tr
                        key={product.id}
                        className="border-b transition-colors last:border-b-0 hover:bg-muted/40"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.title}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="max-w-[200px] truncate font-medium text-foreground">
                            {product.title}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-sm">{product.brand}</td>
                        <td className="py-3 pr-4 text-sm">{product.model}</td>
                        <td className="py-3 pr-4 text-sm">{product.category}</td>
                        <td className="py-3 pr-4 text-sm">{product.stock}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "rounded-full border-0 px-2.5 py-0.5 text-xs font-medium",
                              statusVariant(product.status)
                            )}
                          >
                            {statusLabel(product.status)}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              aria-label="View product"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              aria-label="Edit product"
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length > limit && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {start + 1}-{Math.min(start + limit, filtered.length)} of{" "}
                    {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[3rem] text-center text-sm text-muted-foreground">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
