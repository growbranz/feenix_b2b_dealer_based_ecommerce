"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { createEnquiry, type CreateEnquiryInput } from "@/lib/enquiries/buyer-service"
import { useRouter } from "next/navigation"
import { MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface EnquiryDialogProps {
  productId: string
  productTitle: string
  productDealerId: string
  minimumOrder?: number
  stock?: number
  isOutOfStock?: boolean
}

export function EnquiryDialog({ 
  productId, 
  productTitle, 
  productDealerId,
  minimumOrder = 1,
  stock = 0,
  isOutOfStock = false 
}: EnquiryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState<string>(minimumOrder.toString())
  const [remarks, setRemarks] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const input: CreateEnquiryInput = {
        product_id: productId,
        quantity: parseInt(quantity, 10),
        remarks: remarks.trim() || undefined,
      }

      const result = await createEnquiry(input)

      if (result.success) {
        setSuccess(true)
        // Close dialog after showing success message
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
          setQuantity(minimumOrder.toString())
          setRemarks("")
          // Optionally redirect to dealer's enquiries page
          // router.push("/dealer/enquiries")
        }, 2000)
      } else {
        setError(result.error || "Failed to create enquiry")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false)
      setError(null)
      setSuccess(false)
      setQuantity(minimumOrder.toString())
      setRemarks("")
    }
  }

  const maxQuantity = stock > 0 ? stock : 9999

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="lg"
          className="flex-1 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all border-0"
          disabled={isOutOfStock}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Enquiry
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Send Enquiry</AlertDialogTitle>
          <AlertDialogDescription>
            Send an enquiry for <span className="font-semibold">{productTitle}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700">Enquiry Sent Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The seller will respond to your enquiry soon.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min={minimumOrder}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Minimum order: {minimumOrder} {stock > 0 && `• Available: ${stock}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any specific requirements or questions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {remarks.length}/500
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel 
                type="button" 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </AlertDialogCancel>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Enquiry"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}