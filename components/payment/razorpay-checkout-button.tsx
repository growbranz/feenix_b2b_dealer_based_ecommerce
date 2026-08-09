"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayCheckoutButtonProps {
  orderId: string
  onSuccess?: () => void
}

export function RazorpayCheckoutButton({ orderId, onSuccess }: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Failed to create payment order")

      if (!window.Razorpay) {
        await loadRazorpayScript()
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Feenix Repair",
        description: data.description,
        image: "/logo.png",
        order_id: data.razorpay_order_id,
        prefill: data.prefill,
        theme: { color: "#F97316" },
        retry: { enabled: true, max_count: 3 },
        notes: { order_id: data.order.id, order_number: data.order.order_number },
        handler: async (response: any) => {
          await verifyAndNotify(response, data.order.id)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (e: any) {
      alert(e.message || "Payment failed")
      setLoading(false)
    }
  }

  async function verifyAndNotify(response: any, orderId: string) {
    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || verifyData.error) throw new Error(verifyData.error || "Verification failed")
      onSuccess?.()
    } catch (e: any) {
      alert(e.message || "Payment verification failed")
    } finally {
      setLoading(false)
    }
  }

  function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"))
      document.body.appendChild(script)
    })
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full sm:w-auto">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
      Pay Now
    </Button>
  )
}
