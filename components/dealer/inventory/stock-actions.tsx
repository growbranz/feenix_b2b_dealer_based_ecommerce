"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus, Save, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { InventoryItem } from "./types"

interface StockActionsProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
  onUpdate: (itemId: string, quantity: number, reason: string) => Promise<void>
}

export function StockActions({ item, open, onClose, onUpdate }: StockActionsProps) {
  const [action, setAction] = React.useState<"increase" | "decrease">("increase")
  const [quantity, setQuantity] = React.useState(1)
  const [reason, setReason] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setAction("increase")
      setQuantity(1)
      setReason("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setIsSubmitting(true)
    try {
      const finalQuantity = action === "increase" ? quantity : -quantity
      await onUpdate(item.id, finalQuantity, reason)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!item) return null

  const newStock = item.stock + (action === "increase" ? quantity : -quantity)

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Update Stock</AlertDialogTitle>
          <AlertDialogDescription>
            Adjust stock for {item.title}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">Current Stock: {item.stock}</p>
            </div>
          </div>

          {/* Action Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={action === "increase" ? "default" : "outline"}
              onClick={() => setAction("increase")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Increase
            </Button>
            <Button
              type="button"
              variant={action === "decrease" ? "default" : "outline"}
              onClick={() => setAction("decrease")}
              className="gap-2"
            >
              <Minus className="h-4 w-4" />
              Decrease
            </Button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-lg"
            />
          </div>

          {/* Stock Preview */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
            <span className="text-sm text-muted-foreground">New Stock:</span>
            <span className={`text-lg font-bold ${newStock < 0 ? "text-destructive" : newStock < item.minimum_stock ? "text-amber-600" : "text-emerald-600"}`}>
              {newStock}
            </span>
          </div>

          {newStock < 0 && (
            <p className="text-sm text-destructive">
              Warning: Stock will become negative
            </p>
          )}
          {newStock > 0 && newStock < item.minimum_stock && (
            <p className="text-sm text-amber-600">
              Warning: Stock will be below minimum ({item.minimum_stock})
            </p>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., New stock received, Damaged items, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || newStock < 0}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface BulkStockUpdateProps {
  itemIds: string[]
  open: boolean
  onClose: () => void
  onUpdate: (itemIds: string[], quantity: number, reason: string) => Promise<void>
}

export function BulkStockUpdate({ itemIds, open, onClose, onUpdate }: BulkStockUpdateProps) {
  const [action, setAction] = React.useState<"increase" | "decrease">("increase")
  const [quantity, setQuantity] = React.useState(1)
  const [reason, setReason] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setAction("increase")
      setQuantity(1)
      setReason("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const finalQuantity = action === "increase" ? quantity : -quantity
      await onUpdate(itemIds, finalQuantity, reason)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Bulk Stock Update</AlertDialogTitle>
          <AlertDialogDescription>
            Update stock for {itemIds.length} selected items
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={action === "increase" ? "default" : "outline"}
              onClick={() => setAction("increase")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Increase
            </Button>
            <Button
              type="button"
              variant={action === "decrease" ? "default" : "outline"}
              onClick={() => setAction("decrease")}
              className="gap-2"
            >
              <Minus className="h-4 w-4" />
              Decrease
            </Button>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-lg"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., New stock received, Damaged items, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Updating..." : "Update All"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
