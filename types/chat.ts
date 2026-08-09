import type { Profile } from "@/types"

export type ConversationType = 'direct' | 'group' | 'support'

export type ConversationContextType = 'enquiry' | 'order' | 'payment' | 'profile'

export type ChatMessageType =
  | 'text'
  | 'image'
  | 'pdf'
  | 'invoice'
  | 'quotation'
  | 'order_link'
  | 'payment_link'
  | 'location'

export interface Conversation {
  id: string
  type: ConversationType
  title: string | null
  context_type: ConversationContextType | null
  context_id: string | null
  last_message_preview: string | null
  last_message_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: string
  unread_count: number
  pinned_at: string | null
  archived_at: string | null
  is_muted: boolean
  last_read_at: string | null
  last_delivered_at: string | null
  joined_at: string
  updated_at: string
  profile?: Profile | null
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string | null
  message_type: ChatMessageType
  metadata: any
  reply_to: string | null
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  sender?: Profile | null
  receipt?: MessageReadReceipt | null
}

export interface MessageReadReceipt {
  message_id: string
  user_id: string
  delivered_at: string | null
  read_at: string | null
}

export interface TypingIndicator {
  id: string
  conversation_id: string
  user_id: string
  started_at: string
  expires_at: string
  user?: Profile | null
}

export interface UserPresence {
  user_id: string
  is_online: boolean
  last_seen_at: string
  typing_conversation_id: string | null
}

export interface ChatAttachment {
  file_name: string
  file_url: string
  file_type: string
  file_size?: number
}

export interface ConversationWithDetails extends Conversation {
  participants: ConversationParticipant[]
  my_participant?: ConversationParticipant | null
  other_participants?: ConversationParticipant[]
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: Profile | null
  is_me?: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface ChatSearchFilters {
  search?: string
  type?: ConversationType
  archived?: boolean
  pinned?: boolean
  page?: number
  limit?: number
}

export interface ChatMessageFilters {
  conversationId: string
  before?: string
  after?: string
  limit?: number
  page?: number
}
