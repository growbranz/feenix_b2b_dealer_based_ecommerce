"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { notifyOnMessageReceived } from "@/lib/notifications/notifier"
import type { ChatMessageType, ConversationContextType } from "@/types/chat"

const db = supabaseAdmin as any

async function currentUser() {
  const profile = await getCurrentUserProfile()
  if (!profile?.user?.id) throw new Error("Unauthorized")
  return profile.user
}

function now() {
  return new Date().toISOString()
}

export async function getConversations(options: { search?: string; archived?: boolean; pinned?: boolean; limit?: number; offset?: number } = {}) {
  const user = await currentUser()
  const { search, archived = false, pinned, limit = 50, offset = 0 } = options

  let query = db
    .from("conversation_participants")
    .select(
      `*,
      conversation:conversations(*,
        participants:conversation_participants(*, profile:profiles(id, name, email, avatar_url:profile_image, role))
      )`
    )
    .eq("user_id", user.id)

  if (archived) {
    query = query.not("archived_at", "is", null)
  } else {
    query = query.is("archived_at", null)
  }

  if (pinned === true) query = query.not("pinned_at", "is", null)
  if (pinned === false) query = query.is("pinned_at", null)

  const { data, error } = await query
    .order("conversation.last_message_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  let rows = (data || []).map((p: any) => p.conversation as any)
  if (search?.trim()) {
    const q = search.trim().toLowerCase()
    rows = rows.filter((c: any) =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      c.participants?.some(
        (p: any) =>
          p.user_id !== user.id &&
          (p.profile?.name?.toLowerCase().includes(q) || p.profile?.email?.toLowerCase().includes(q))
      ) ||
      c.last_message_preview?.toLowerCase().includes(q)
    )
  }

  return rows
}

export async function getConversationById(conversationId: string) {
  const user = await currentUser()
  const { data: participant } = await db
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()
  if (!participant) throw new Error("Conversation not found")

  const { data, error } = await db
    .from("conversations")
    .select(
      `*,
      participants:conversation_participants(*, profile:profiles(id, name, email, avatar_url:profile_image, role))`
    )
    .eq("id", conversationId)
    .single()
  if (error) throw error
  return data as any
}

export async function getMessages(conversationId: string, options: { limit?: number; before?: string } = {}) {
  const user = await currentUser()
  await getConversationById(conversationId)

  const { limit = 50, before } = options

  let query = db
    .from("messages")
    .select(
      `*,
      sender:profiles(id, name, avatar_url:profile_image, role),
      read_receipts:message_read_receipts(user_id, read_at)`
    )
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (before) query = query.lt("created_at", before)

  const { data, error } = await query
  if (error) throw error

  const messages = (data || []).reverse().map((m: any) => ({
    ...m,
    is_me: m.sender_id === user.id,
    status: m.read_receipts?.some((r: any) => r.user_id !== user.id && r.read_at) ? "read" : "sent",
  }))

  return messages as any[]
}

export async function sendMessage(
  conversationId: string,
  payload: {
    content?: string
    messageType?: ChatMessageType
    metadata?: any
    replyTo?: string | null
  } = {}
) {
  const user = await currentUser()
  await getConversationById(conversationId)

  const { content, messageType = "text", metadata = {}, replyTo } = payload

  const preview = content || (messageType === "text" ? "" : `[${messageType}]`)

  const messagePayload = {
    conversation_id: conversationId,
    sender_id: user.id,
    content: preview,
    message_type: messageType,
    metadata,
    reply_to: replyTo || null,
  }
  console.log("sendMessage payload:", JSON.stringify(messagePayload, null, 2))

  const { data, error } = await db
    .from("messages")
    .insert(messagePayload)
    .select()
    .single()

  if (error) {
    console.error("sendMessage insert error:", {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      error,
    })
    throw error
  }

  const { data: participants } = await db
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id)

  for (const p of participants || []) {
    try {
      await notifyOnMessageReceived(conversationId, user.email || "User", p.user_id, preview, user.id)
    } catch (notificationError: any) {
      console.error("sendMessage notification error:", {
        message: notificationError?.message,
        details: notificationError?.details,
        hint: notificationError?.hint,
        code: notificationError?.code,
        error: notificationError,
      })
    }
  }

  revalidatePath(`/admin/messages`)
  revalidatePath(`/dealer/messages`)
  return data as any
}

export async function uploadAttachment(formData: FormData) {
  const user = await currentUser()
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file provided")

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split(".").pop() || "bin"
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const path = `${user.id}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`

  const { error: uploadError } = await db.storage.from("chat-attachments").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: publicUrlData } = db.storage.from("chat-attachments").getPublicUrl(path)

  return {
    path,
    publicUrl: publicUrlData.publicUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  }
}

export async function markConversationRead(conversationId: string) {
  const user = await currentUser()
  const { error } = await db
    .from("conversation_participants")
    .update({ unread_count: 0, last_read_at: now() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
  if (error) throw error
  revalidatePath(`/admin/messages`)
  revalidatePath(`/dealer/messages`)
  return { success: true }
}

export async function pinConversation(conversationId: string, pinned: boolean) {
  const user = await currentUser()
  const { error } = await db
    .from("conversation_participants")
    .update({ pinned_at: pinned ? now() : null })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
  if (error) throw error
  revalidatePath(`/admin/messages`)
  revalidatePath(`/dealer/messages`)
  return { success: true }
}

export async function archiveConversation(conversationId: string, archived: boolean) {
  const user = await currentUser()
  const { error } = await db
    .from("conversation_participants")
    .update({ archived_at: archived ? now() : null })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
  if (error) throw error
  revalidatePath(`/admin/messages`)
  revalidatePath(`/dealer/messages`)
  return { success: true }
}

export async function editMessage(messageId: string, content: string) {
  const user = await currentUser()
  const { error } = await db
    .from("messages")
    .update({ content, edited_at: now() })
    .eq("id", messageId)
    .eq("sender_id", user.id)
    .is("deleted_at", null)
  if (error) throw error
  return { success: true }
}

export async function deleteMessage(messageId: string) {
  const user = await currentUser()
  const { error } = await db
    .from("messages")
    .update({ content: null, deleted_at: now() })
    .eq("id", messageId)
    .eq("sender_id", user.id)
    .is("deleted_at", null)
  if (error) throw error
  return { success: true }
}

export async function reportConversation(conversationId: string, reason: string) {
  const user = await currentUser()
  const { error } = await db.from("conversation_reports").insert({
    conversation_id: conversationId,
    reporter_id: user.id,
    reason,
  })
  if (error) throw error
  return { success: true }
}

export async function getOrCreateDirectConversation(
  otherUserId: string,
  context?: { type: ConversationContextType; id: string }
) {
  const user = await currentUser()

  const { data: mine } = await db
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id)

  const myIds = (mine || []).map((r: any) => r.conversation_id)
  if (myIds.length === 0) return createDirectConversation(user.id, otherUserId, context)

  const { data: theirs } = await db
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", otherUserId)
    .in("conversation_id", myIds)

  const shared = (theirs || []).map((r: any) => r.conversation_id)
  if (shared.length === 0) return createDirectConversation(user.id, otherUserId, context)

  const { data: existing } = await db
    .from("conversations")
    .select("*")
    .in("id", shared)
    .eq("type", "direct")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing
  return createDirectConversation(user.id, otherUserId, context)
}

async function createDirectConversation(
  userId: string,
  otherUserId: string,
  context?: { type: ConversationContextType; id: string }
) {
  const { data: conversation, error } = await db
    .from("conversations")
    .insert({
      type: "direct",
      context_type: context?.type || null,
      context_id: context?.id || null,
    })
    .select()
    .single()
  if (error || !conversation) throw error || new Error("Failed to create conversation")

  const { error: pError } = await db.from("conversation_participants").insert([
    { conversation_id: conversation.id, user_id: userId, role: "member" },
    { conversation_id: conversation.id, user_id: otherUserId, role: "member" },
  ])
  if (pError) throw pError

  return conversation
}

export async function searchUsers(query: string, role?: "ADMIN" | "DEALER") {
  const user = await currentUser()
  let q = db
    .from("profiles")
    .select("id, name, email, avatar_url:profile_image, role")
    .neq("id", user.id)
    .ilike("name", `%${query}%`)
    .limit(10)
  if (role) q = q.eq("role", role)
  const { data, error } = await q
  if (error) throw error
  return (data || []) as any[]
}

export async function searchMessages(conversationId: string, query: string) {
  const user = await currentUser()
  await getConversationById(conversationId)
  const { data, error } = await db
    .from("messages")
    .select(
      `*,
      sender:profiles(id, name, avatar_url:profile_image)`
    )
    .eq("conversation_id", conversationId)
    .ilike("content", `%${query}%`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50)
  if (error) throw error
  return (data || []).reverse() as any[]
}

export async function getTypingIndicators(conversationId: string) {
  const user = await currentUser()
  const { data, error } = await db
    .from("typing_indicators")
    .select(
      `*,
      profile:profiles(id, name, avatar_url:profile_image)`
    )
    .eq("conversation_id", conversationId)
    .neq("user_id", user.id)
    .gt("expires_at", now())
  if (error) throw error
  return (data || []) as any[]
}

export async function setTyping(conversationId: string) {
  const user = await currentUser()
  const expires = new Date(Date.now() + 8000).toISOString()
  const { error } = await db.from("typing_indicators").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      started_at: now(),
      expires_at: expires,
    },
    { onConflict: "conversation_id, user_id" }
  )
  if (error) throw error
  return { success: true }
}

export async function updatePresence(isOnline: boolean) {
  const user = await currentUser()
  const { error } = await db.from("user_presence").upsert(
    {
      user_id: user.id,
      is_online: isOnline,
      last_seen_at: now(),
    },
    { onConflict: "user_id" }
  )
  if (error) throw error
  return { success: true }
}

export async function getParticipantsPresence(userIds: string[]) {
  if (userIds.length === 0) return []
  const { data, error } = await db
    .from("user_presence")
    .select("*")
    .in("user_id", userIds)
  if (error) throw error
  return (data || []) as any[]
}
