"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/auth.helpers"
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
  const { user } = await requireAdmin()
  const result = await processRefund(paymentId, {
    amount: options.amount,
    reason: options.reason,
    actorId: user.id,
  })
  revalidatePath("/admin/payments")
  revalidatePath("/dealer/payments")
  return result
}
