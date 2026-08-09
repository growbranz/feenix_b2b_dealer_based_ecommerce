"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

export type ProductApprovalAction = "approve" | "reject" | "request" | "archive" | "delete"

interface ProductApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: ProductApprovalAction | null
  count?: number
  onConfirm: (reason: string) => void
}

const titles: Record<ProductApprovalAction, string> = {
  approve: "Approve Product",
  reject: "Reject Product",
  request: "Request Changes",
  archive: "Archive Product",
  delete: "Delete Product",
}

const requiresReason: ProductApprovalAction[] = ["reject", "request"]

export function ProductApprovalDialog({
  open,
  onOpenChange,
  action,
  count = 1,
  onConfirm,
}: ProductApprovalDialogProps) {
  const [reason, setReason] = React.useState("")
  const title = action ? titles[action] : "Confirm Action"
  const needsReason = action ? requiresReason.includes(action) : false

  const handleConfirm = () => {
    onConfirm(reason)
    setReason("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    setReason("")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {action === "delete"
              ? `Permanently delete ${count > 1 ? `${count} products` : "this product"}? This cannot be undone.`
              : `${title} for ${count > 1 ? `${count} products` : "this product"}?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {needsReason && (
          <div className="grid gap-2 py-2">
            <label htmlFor="approval-reason" className="text-sm font-medium">
              Reason
            </label>
            <Textarea
              id="approval-reason"
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={needsReason && !reason.trim()}
            className={
              action === "reject" || action === "delete"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {title.split(" ")[0]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
