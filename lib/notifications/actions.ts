"use server"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { sendNotificationEmail } from "@/lib/email/workflow"
import type { NotificationInput, NotificationFilters, NotificationChannel } from "@/types/notifications"

const db = supabaseAdmin as any

async function currentUser() {
  const p = await getCurrentUserProfile()
  if (!p?.user?.id) throw new Error("Unauthorized")
  return p.user
}

function now() {
  return new Date().toISOString()
}

export async function createNotification(input: NotificationInput, actorId?: string | null) {
  const { data, error } = await db
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || "information",
      category: input.category || "system",
      source: input.source || null,
      source_id: input.sourceId || null,
      link: input.link || null,
      data: input.data || {},
      priority: input.priority || "information",
    })
    .select()
    .single()

  if (error) throw error

  await logActivity({
    userId: actorId,
    action: "notification_created",
    entityType: "notification",
    entityId: data.id,
    status: input.type || "information",
    metadata: { user_id: input.userId, category: input.category },
  })

  if (input.sendEmail !== false) {
    try {
      const canEmail = await canSendEmail(input.userId, input.category || "system")
      if (canEmail) {
        await sendNotificationEmail(input.userId, {
          subject: input.emailSubject || input.title,
          message: input.message,
          link: input.link || null,
        })
      }
    } catch (e: any) {
      console.warn("Email notification failed:", e.message)
    }
  }

  return data as any
}

async function canSendEmail(userId: string, category: string) {
  const { data } = await db
    .from("notification_preferences")
    .select("enabled")
    .eq("user_id", userId)
    .eq("channel", "email")
    .eq("category", category)
    .single()

  if (!data) return true
  return data.enabled
}

export async function createBulkNotifications(inputs: NotificationInput[], actorId?: string | null) {
  const results = []
  for (const input of inputs) {
    try {
      results.push(await createNotification(input, actorId))
    } catch (e: any) {
      console.warn("Failed to create notification:", e.message)
    }
  }
  return results
}

export async function getNotifications(filters: NotificationFilters = {}) {
  const user = await currentUser()
  const {
    search,
    type,
    category,
    isRead,
    archived = false,
    limit = 20,
    page = 1,
  } = filters

  let query = db
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .is("deleted_at", null)

  if (archived) {
    query = query.not("archived_at", "is", null)
  } else {
    query = query.is("archived_at", null)
  }

  if (isRead !== undefined) query = query.eq("is_read", isRead)
  if (type) query = query.eq("type", type)
  if (category) query = query.eq("category", category)
  if (search?.trim()) {
    const q = `%${search.trim()}%`
    query = query.or(`title.ilike.${q},message.ilike.${q}`)
  }

  const offset = (page - 1) * limit
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw error

  return {
    data: (data || []) as any[],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1,
  }
}

export async function getUnreadCount(userId?: string) {
  const user = userId ? { id: userId } : await currentUser()
  const { count, error } = await db
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)
    .is("deleted_at", null)
    .is("archived_at", null)
  if (error) throw error
  return count || 0
}

export async function getLatestNotifications(limit = 10) {
  const user = await currentUser()
  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data || []) as any[]
}

export async function markAsRead(notificationId: string) {
  const user = await currentUser()
  const { error } = await db
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)
  if (error) throw error
  revalidatePath("/admin/notifications")
  revalidatePath("/dealer/notifications")
  return { success: true }
}

export async function markAllRead() {
  const user = await currentUser()
  const { error } = await db
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)
  if (error) throw error
  revalidatePath("/admin/notifications")
  revalidatePath("/dealer/notifications")
  return { success: true }
}

export async function archiveNotification(notificationId: string, archived: boolean) {
  const user = await currentUser()
  const { error } = await db
    .from("notifications")
    .update({ archived_at: archived ? now() : null })
    .eq("id", notificationId)
    .eq("user_id", user.id)
  if (error) throw error
  revalidatePath("/admin/notifications")
  revalidatePath("/dealer/notifications")
  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const user = await currentUser()
  const { error } = await db
    .from("notifications")
    .update({ deleted_at: now() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
  if (error) throw error
  revalidatePath("/admin/notifications")
  revalidatePath("/dealer/notifications")
  return { success: true }
}

export async function logActivity(input: {
  userId?: string | null
  action: string
  entityType?: string
  entityId?: string
  status?: string
  metadata?: any
}) {
  const { error } = await db.from("activity_logs").insert({
    user_id: input.userId || null,
    action: input.action,
    entity_type: input.entityType || null,
    entity_id: input.entityId || null,
    status: input.status || null,
    metadata: input.metadata || {},
  })
  if (error) throw error
}

export async function getActivityLogs(options: { userId?: string; limit?: number; page?: number } = {}) {
  const current = await getCurrentUserProfile()
  const isAdmin = current?.profile?.role === "ADMIN"

  const { userId, limit = 20, page = 1 } = options
  let query = db.from("activity_logs").select("*", { count: "exact" })

  if (!isAdmin && current?.profile?.id) {
    query = query.eq("user_id", current.profile.id)
  } else if (userId) {
    query = query.eq("user_id", userId)
  }

  const offset = (page - 1) * limit
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw error

  return {
    data: (data || []) as any[],
    count: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1,
  }
}

const DEFAULT_CATEGORIES = [
  "auth",
  "order",
  "payment",
  "inventory",
  "enquiry",
  "message",
  "dealer",
  "product",
  "system",
  "invoice",
]

export async function ensureDefaultPreferences(userId: string) {
  for (const category of DEFAULT_CATEGORIES) {
    for (const channel of ["in_app", "email"] as NotificationChannel[]) {
      await db.from("notification_preferences").upsert(
        {
          user_id: userId,
          channel,
          category,
          enabled: true,
        },
        { onConflict: "user_id, channel, category" }
      )
    }
  }
}

export async function getPreferences(userId?: string) {
  const user = userId ? { id: userId } : await currentUser()
  const { data, error } = await db
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true })
  if (error) throw error
  if ((data || []).length === 0) {
    await ensureDefaultPreferences(user.id)
    return getPreferences(user.id)
  }
  return (data || []) as any[]
}

export async function updatePreference(preferenceId: string, enabled: boolean) {
  const user = await currentUser()
  const { data: existing } = await db
    .from("notification_preferences")
    .select("user_id")
    .eq("id", preferenceId)
    .single()
  if (!existing || existing.user_id !== user.id) throw new Error("Unauthorized")

  const { error } = await db.from("notification_preferences").update({ enabled }).eq("id", preferenceId)
  if (error) throw error
  return { success: true }
}
