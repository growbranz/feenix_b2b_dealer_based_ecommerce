-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversation types
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'support');

-- Context that started the conversation
CREATE TYPE conversation_context_type AS ENUM ('enquiry', 'order', 'payment', 'profile');

-- Supported message content types
CREATE TYPE message_type AS ENUM (
  'text',
  'image',
  'pdf',
  'invoice',
  'quotation',
  'order_link',
  'payment_link',
  'location'
);

-- Conversation container
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type conversation_type NOT NULL DEFAULT 'direct',
  title TEXT,
  context_type conversation_context_type,
  context_id UUID,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  unread_count INTEGER NOT NULL DEFAULT 0,
  pinned_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ,
  last_delivered_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT,
  message_type message_type NOT NULL DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Read/delivered receipts per message per participant
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  UNIQUE (message_id, user_id)
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '10 seconds',
  UNIQUE (conversation_id, user_id)
);

-- User presence for online / last seen
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  typing_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation reports / moderation
CREATE TABLE IF NOT EXISTS conversation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_context ON conversations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id, archived_at, pinned_at);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_conversation ON typing_indicators(conversation_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_conversation ON conversation_reports(conversation_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_preview = LEFT(NEW.content, 120),
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON messages;
CREATE TRIGGER trg_update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();

CREATE OR REPLACE FUNCTION bump_participant_unread()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversation_participants
  SET unread_count = unread_count + 1,
      updated_at = now()
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bump_participant_unread ON messages;
CREATE TRIGGER trg_bump_participant_unread
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION bump_participant_unread();

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for conversations: participants can read
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_participants_select ON conversations;
CREATE POLICY conversations_participants_select ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS participants_select ON conversation_participants;
CREATE POLICY participants_select ON conversation_participants
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS participants_update_self ON conversation_participants;
CREATE POLICY participants_update_self ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS messages_select_participants ON messages;
CREATE POLICY messages_select_participants ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS messages_insert_sender ON messages;
CREATE POLICY messages_insert_sender ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS messages_update_sender ON messages;
CREATE POLICY messages_update_sender ON messages
  FOR UPDATE USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS read_receipts_select_participants ON message_read_receipts;
CREATE POLICY read_receipts_select_participants ON message_read_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN messages m ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_read_receipts.message_id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS read_receipts_upsert_self ON message_read_receipts;
CREATE POLICY read_receipts_upsert_self ON message_read_receipts
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS typing_select_participants ON typing_indicators;
CREATE POLICY typing_select_participants ON typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = typing_indicators.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS typing_upsert_self ON typing_indicators;
CREATE POLICY typing_upsert_self ON typing_indicators
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS presence_select_all ON user_presence;
CREATE POLICY presence_select_all ON user_presence
  FOR SELECT USING (true);

DROP POLICY IF EXISTS presence_upsert_self ON user_presence;
CREATE POLICY presence_upsert_self ON user_presence
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS reports_select_reporter ON conversation_reports;
CREATE POLICY reports_select_reporter ON conversation_reports
  FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS reports_insert_reporter ON conversation_reports;
CREATE POLICY reports_insert_reporter ON conversation_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Storage policies for chat attachments
DROP POLICY IF EXISTS chat_attachments_select_participants ON storage.objects;
DROP POLICY IF EXISTS chat_attachments_insert_sender ON storage.objects;

CREATE POLICY chat_attachments_select_participants ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE (m.metadata->>'storage_path') = storage.objects.name AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY chat_attachments_insert_sender ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.role() = 'authenticated'
  );
