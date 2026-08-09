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
import type { AdminDealer } from "./data"

interface DealerRejectDialogProps {
  dealer: AdminDealer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

export function DealerRejectDialog({
  dealer,
  open,
  onOpenChange,
  onConfirm,
}: DealerRejectDialogProps) {
  const [reason, setReason] = React.useState(dealer?.rejection_reason || "")

  const handleConfirm = () => {
    onConfirm(reason)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Dealer</AlertDialogTitle>
          <AlertDialogDescription>
            {dealer
              ? `Reject ${dealer.business_name}? Please provide a reason below.`
              : "Reject this dealer? Please provide a reason."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-2">
          <label htmlFor="rejection-reason" className="text-sm font-medium">
            Reason
          </label>
          <Textarea
            id="rejection-reason"
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
