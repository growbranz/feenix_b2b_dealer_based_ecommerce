"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/auth.helpers"
import { logActivity } from "@/lib/activity/service"
import {
  getPaymentWithDetails,
  getPayments,
  getPaymentStats,
  getDealerPaymentStats,
  processRefund,
} from "@/lib/payment/service"
import type { PaymentFilterOptions } from "@/types/payment"

export async function getPaymentsAction(options: PaymentFilterOptions = {}) {
  return getPayments(options)
}

export async function getPaymentStatsAction() {
  return getPaymentStats()
}

export async function getDealerPaymentStatsAction(dealerId: string) {
  return getDealerPaymentStats(dealerId)
}

export async function getPaymentAction(paymentId: string) {
  return getPaymentWithDetails(paymentId)
}

export async function refundPaymentAction(
  paymentId: string,
  options: { amount?: number; reason?: string } = {}
) {
  const { user, profile } = await requireAdmin()
  const payment = await getPaymentWithDetails(paymentId)
  
  const result = await processRefund(paymentId, {
    amount: options.amount,
    reason: options.reason,
    actorId: user.id,
  })

  await logActivity({
    type: "PAYMENT_ACTION",
    action: `Refunded payment of ${options.amount || payment?.amount || 0}`,
    actor_id: user.id,
    actor_name: profile.name || user.email,
    actor_role: profile.role,
    target_type: "payment",
    target_id: paymentId,
    target_name: payment?.order?.order_number || "Unknown",
    metadata: { 
      amount: options.amount || payment?.amount,
      reason: options.reason 
    },
  })

  revalidatePath("/admin/payments")
  revalidatePath("/dealer/payments")
  return result
}
