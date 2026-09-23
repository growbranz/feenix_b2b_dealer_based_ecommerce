"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
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

export type ProductApprovalAction = "approve" | "reject" | "request" | "archive" | "suspend" | "delete"

interface ProductApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: ProductApprovalAction | null
  count?: number
  onConfirm: (reason: string) => Promise<void> | void
}

const titles: Record<ProductApprovalAction, string> = {
  approve: "Approve Product",
  reject: "Reject Product",
  request: "Request Changes",
  archive: "Archive Product",
  suspend: "Suspend Product",
  delete: "Delete Product",
}

const buttonTexts: Record<ProductApprovalAction, string> = {
  approve: "Approve",
  reject: "Reject",
  request: "Request Changes",
  archive: "Archive",
  suspend: "Suspend",
  delete: "Delete",
}

const descriptions: Partial<Record<ProductApprovalAction, string>> = {
  request: "Please provide the reason for requesting changes to this product.",
  reject: "Please provide the reason for rejecting this product.",
}

const placeholders: Partial<Record<ProductApprovalAction, string>> = {
  request: "Enter the required changes...",
  reject: "Enter reason...",
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
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const title = action ? titles[action] : "Confirm Action"
  const needsReason = action ? requiresReason.includes(action) : false
  const buttonText = action ? buttonTexts[action] : "Confirm"
  const isDisabled = needsReason && !reason.trim()

  const handleConfirm = async () => {
    if (isDisabled) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(onConfirm(reason))
    } finally {
      setIsSubmitting(false)
    }
    setReason("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    setReason("")
  }

  const description =
    action === "request"
      ? descriptions.request
      : action === "reject"
      ? descriptions.reject
      : action === "delete"
      ? `Permanently delete ${count > 1 ? `${count} products` : "this product"}? This cannot be undone.`
      : `${title} for ${count > 1 ? `${count} products` : "this product"}?`

  const placeholder =
    action === "request"
      ? placeholders.request
      : action === "reject"
      ? placeholders.reject
      : "Enter reason..."

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full sm:max-w-[560px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {needsReason && (
          <div className="grid gap-2 py-2">
            <label htmlFor="approval-reason" className="text-sm font-medium">
              Reason
            </label>
            <Textarea
              id="approval-reason"
              placeholder={placeholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px] w-full resize-none"
              disabled={isSubmitting}
              required
            />
            {isDisabled && (
              <p className="text-xs text-muted-foreground">A reason is required to continue.</p>
            )}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDisabled || isSubmitting}
            className={
              action === "reject" || action === "delete"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {buttonText}
              </>
            ) : (
              buttonText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
