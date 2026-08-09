"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Package, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { RecentProduct, RecentProductStatus } from "./types"

interface ProductDrawerProps {
  product: RecentProduct | null
  open: boolean
  onClose: () => void
}

const statusVariant = (status: RecentProductStatus) => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-600"
    case "INACTIVE":
      return "bg-slate-500/10 text-slate-600"
    case "OUT_OF_STOCK":
      return "bg-rose-500/10 text-rose-600"
    case "PENDING":
      return "bg-amber-500/10 text-amber-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const statusLabel = (status: RecentProductStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())

export function ProductDrawer({ product, open, onClose }: ProductDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-border/50 bg-card shadow-2xl"
          >
            {product && (
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 p-6">
                  <div>
                    <h2 className="text-xl font-semibold">Product Details</h2>
                    <p className="text-sm text-muted-foreground">{product.id}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Gallery */}
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{product.title}</h3>
                        <p className="mt-1 text-muted-foreground">
                          {product.brand} • {product.model}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full border-0 px-3 py-1 text-sm font-medium",
                          statusVariant(product.status)
                        )}
                      >
                        {statusLabel(product.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Brand</p>
                        <p className="mt-1 font-semibold">{product.brand}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="mt-1 font-semibold">{product.model}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="mt-1 font-semibold">{product.category}</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <p className="mt-1 font-semibold">{product.stock}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      High-quality {product.title} for {product.brand} {product.model}.
                      Compatible with various repair scenarios. OEM quality guaranteed.
                    </p>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Pricing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">Dealer Price</p>
                        <p className="mt-1 font-semibold">₹1,299</p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">MRP</p>
                        <p className="mt-1 font-semibold">₹1,499</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Inventory */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Inventory</h4>
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Available Stock</p>
                          <p className="mt-1 font-semibold">{product.stock} units</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Specifications */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium">{product.id.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Condition</span>
                        <span className="font-medium">New</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warranty</span>
                        <span className="font-medium">6 Months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">50g</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Timestamps */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Timestamps</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">Jan 15, 2026</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="font-medium">Feb 20, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/50 p-6">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button>View on Website</Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
