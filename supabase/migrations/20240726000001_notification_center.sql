-- Extend existing notifications table
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS source VARCHAR(50),
  ADD COLUMN IF NOT EXISTS source_id UUID,
  ADD COLUMN IF NOT EXISTS link TEXT,
  ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'information',
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source);
CREATE INDEX IF NOT EXISTS idx_notifications_archived ON notifications(archived_at);
CREATE INDEX IF NOT EXISTS idx_notifications_deleted ON notifications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
  category VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, channel, category)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_channel ON notification_preferences(user_id, channel);

-- Activity timeline
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  status VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_self ON notifications;
CREATE POLICY notifications_select_self ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_self ON notifications;
CREATE POLICY notifications_update_self ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_delete_self ON notifications;
CREATE POLICY notifications_delete_self ON notifications
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_select_self ON notification_preferences;
CREATE POLICY notification_preferences_select_self ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notification_preferences_update_self ON notification_preferences;
CREATE POLICY notification_preferences_update_self ON notification_preferences
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS activity_logs_select_admin ON activity_logs;
CREATE POLICY activity_logs_select_admin ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS activity_logs_select_self ON activity_logs;
CREATE POLICY activity_logs_select_self ON activity_logs
  FOR SELECT USING (user_id = auth.uid());
