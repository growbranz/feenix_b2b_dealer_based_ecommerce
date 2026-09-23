"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createNotification } from "./actions"
import { logActivity } from "@/lib/activity/service"

const db = supabaseAdmin as any

/**
 * Dealer Status Notifications
 */

export async function notifyDealerRegistered(dealerId: string, dealerName: string) {
  // Notify all admins about new dealer registration
  const { data: admins } = await db
    .from("profiles")
    .select("id")
    .eq("role", "ADMIN")

  if (admins && admins.length > 0) {
    await Promise.all(
      admins.map((admin: any) =>
        createNotification({
          userId: admin.id,
          title: "New Dealer Registration",
          message: `New dealer "${dealerName}" has registered and requires verification.`,
          type: "information",
          category: "dealer",
          source: "dealer",
          sourceId: dealerId,
          link: "/admin/dealers",
          priority: "high",
          sendEmail: true,
          emailSubject: "New Dealer Registration Requires Verification",
        })
      )
    )
  }
}

export async function notifyDealerVerified(dealerId: string, dealerName: string) {
  await createNotification({
    userId: dealerId,
    title: "Account Verified",
    message: "Your dealer account has been verified. You can now add products.",
    type: "success",
    category: "dealer",
    source: "dealer",
    sourceId: dealerId,
    link: "/dealer/products",
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Dealer Account Has Been Verified",
  })
}

export async function notifyDealerRejected(dealerId: string, dealerName: string, reason?: string) {
  const message = reason 
    ? `Your dealer registration has been rejected. Reason: ${reason}`
    : "Your dealer registration has been rejected."

  await createNotification({
    userId: dealerId,
    title: "Registration Rejected",
    message,
    type: "error",
    category: "dealer",
    source: "dealer",
    sourceId: dealerId,
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Dealer Registration Has Been Rejected",
  })
}

export async function notifyDealerSuspended(dealerId: string, dealerName: string) {
  await createNotification({
    userId: dealerId,
    title: "Account Suspended",
    message: "Your dealer account has been suspended. Please contact support for more information.",
    type: "error",
    category: "dealer",
    source: "dealer",
    sourceId: dealerId,
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Dealer Account Has Been Suspended",
  })
}

export async function notifyDealerReactivated(dealerId: string, dealerName: string) {
  await createNotification({
    userId: dealerId,
    title: "Account Reactivated",
    message: "Your dealer account has been reactivated. You can now add products.",
    type: "success",
    category: "dealer",
    source: "dealer",
    sourceId: dealerId,
    link: "/dealer/products",
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Dealer Account Has Been Reactivated",
  })
}

/**
 * Product Status Notifications
 */

export async function notifyProductSubmitted(productId: string, productTitle: string, dealerId: string, dealerName: string) {
  // Notify all admins about new product submission
  const { data: admins } = await db
    .from("profiles")
    .select("id")
    .eq("role", "ADMIN")

  if (admins && admins.length > 0) {
    await Promise.all(
      admins.map((admin: any) =>
        createNotification({
          userId: admin.id,
          title: "New Product Pending Approval",
          message: `Product "${productTitle}" from ${dealerName} is waiting for approval.`,
          type: "information",
          category: "product",
          source: "product",
          sourceId: productId,
          link: "/admin/products",
          priority: "high",
          sendEmail: true,
          emailSubject: "New Product Pending Approval",
        })
      )
    )
  }
}

export async function notifyProductApproved(productId: string, productTitle: string, dealerId: string) {
  await createNotification({
    userId: dealerId,
    title: "Product Approved",
    message: `Your product "${productTitle}" has been approved and is now live.`,
    type: "success",
    category: "product",
    source: "product",
    sourceId: productId,
    link: `/dealer/products`,
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Product Has Been Approved",
  })
}

export async function notifyProductRejected(productId: string, productTitle: string, dealerId: string, reason?: string) {
  const message = reason
    ? `Your product "${productTitle}" was rejected. Reason: ${reason}`
    : `Your product "${productTitle}" was rejected.`

  await createNotification({
    userId: dealerId,
    title: "Product Rejected",
    message,
    type: "error",
    category: "product",
    source: "product",
    sourceId: productId,
    link: `/dealer/products`,
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Product Has Been Rejected",
  })
}

export async function notifyProductSuspended(productId: string, productTitle: string, dealerId: string) {
  await createNotification({
    userId: dealerId,
    title: "Product Suspended",
    message: `Your product "${productTitle}" has been suspended and is no longer visible.`,
    type: "error",
    category: "product",
    source: "product",
    sourceId: productId,
    link: `/dealer/products`,
    priority: "high",
    sendEmail: true,
    emailSubject: "Your Product Has Been Suspended",
  })
}

export async function notifyProductDeactivated(productId: string, productTitle: string, dealerId: string) {
  await createNotification({
    userId: dealerId,
    title: "Product Deactivated",
    message: `Your product "${productTitle}" has been deactivated.`,
    type: "information",
    category: "product",
    source: "product",
    sourceId: productId,
    link: `/dealer/products`,
    priority: "medium",
    sendEmail: false,
  })
}

/**
 * Activity Logging Helpers
 */

export async function logDealerActivity(action: string, actorId: string, actorName: string, actorRole: string, dealerId: string, dealerName: string) {
  await logActivity({
    type: "DEALER_ACTION",
    action,
    actor_id: actorId,
    actor_name: actorName,
    actor_role: actorRole,
    target_type: "dealer",
    target_id: dealerId,
    target_name: dealerName,
  })
}

export async function logProductActivity(action: string, actorId: string, actorName: string, actorRole: string, productId: string, productName: string) {
  await logActivity({
    type: "PRODUCT_ACTION",
    action,
    actor_id: actorId,
    actor_name: actorName,
    actor_role: actorRole,
    target_type: "product",
    target_id: productId,
    target_name: productName,
  })
}
