"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminDrawer } from "@/components/admin/shared/admin-drawer"
import { cn } from "@/lib/utils"
import { dateFormatter } from "@/lib/utils"
import { formatCurrency } from "./data"
import type { AdminProduct } from "@/lib/admin/products-service"
import { CheckCircle2, XCircle, MessageSquare, Archive, Trash2, Send, Package, ImageIcon, Clock } from "lucide-react"

interface ProductDetailDrawerProps {
  product: AdminProduct | null
  onClose: () => void
  onAction: (action: "approve" | "reject" | "request" | "archive" | "delete") => void
  onAddComment: (text: string) => void
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-slate-100 text-slate-700",
  OUT_OF_STOCK: "bg-rose-100 text-rose-700",
}

export function ProductDetailDrawer({ product, onClose, onAction, onAddComment }: ProductDetailDrawerProps) {
  const [comment, setComment] = React.useState("")

  const handleSend = () => {
    if (comment.trim()) {
      onAddComment(comment)
      setComment("")
    }
  }

  return (
    <AdminDrawer
      open={!!product}
      onClose={onClose}
      title={product ? product.title : "Product Details"}
      width="max-w-2xl"
      footer={
        product ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onAction("request")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Changes
            </Button>
            <Button variant="outline" size="sm" className="text-rose-600" onClick={() => onAction("reject")}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction("archive")}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button size="sm" onClick={() => onAction("approve")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        ) : null
      }
    >
      {product && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={cn("text-xs capitalize", statusStyles[product.status] || "bg-slate-100 text-slate-700")}>
              {product.status.toLowerCase().replace("_", " ")}
            </Badge>
            <span className="text-sm text-slate-500">Updated {dateFormatter(product.updated_at, "long")}</span>
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-500" />
                Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {product.images.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Package className="h-8 w-8" />
                  <p className="mt-2 text-sm">No images uploaded</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {product.images.map((src, idx) => (
                    <div key={idx} className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Price" value={formatCurrency(product.price)} />
            <MetricCard label="Bulk Price" value={product.bulk_price ? formatCurrency(product.bulk_price) : "—"} />
            <MetricCard label="Stock" value={product.stock.toString()} />
            <MetricCard label="Min Order" value={product.min_order.toString()} />
            <MetricCard label="Condition" value={product.condition || "—"} />
            <MetricCard label="Warranty" value={product.warranty || "—"} />
          </div>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-slate-600">
              <p>{product.description || "No description provided."}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <dl className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-400">Brand</dt>
                  <dd className="text-sm font-medium text-slate-900">{product.brand_name || "—"}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-400">Category</dt>
                  <dd className="text-sm font-medium text-slate-900">{product.category_name || "—"}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-400">Model</dt>
                  <dd className="text-sm font-medium text-slate-900">{product.model_name || "—"}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs font-medium text-slate-400">Quality</dt>
                  <dd className="text-sm font-medium text-slate-900">{product.quality || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Dealer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 text-sm">
              <p className="font-medium text-slate-900">{product.dealer_name}</p>
              <p className="text-slate-600">{product.dealer_email || "—"}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Created</p>
                    <p className="text-xs text-slate-500">{dateFormatter(product.created_at, "long")}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Last Updated</p>
                    <p className="text-xs text-slate-500">{dateFormatter(product.updated_at, "long")}</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="destructive" size="sm" onClick={() => onAction("delete")}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </Button>
          </div>
        </div>
      )}
    </AdminDrawer>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  )
}
