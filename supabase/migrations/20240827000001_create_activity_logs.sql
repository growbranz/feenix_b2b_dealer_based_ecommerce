-- Update activity_logs table to match new schema
-- This migration adds new columns for better audit trail tracking
-- while maintaining backward compatibility with existing data

-- Add new columns if they don't exist
ALTER TABLE activity_logs
  ADD COLUMN IF NOT EXISTS type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS actor_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS actor_role VARCHAR(50),
  ADD COLUMN IF NOT EXISTS target_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS target_id UUID,
  ADD COLUMN IF NOT EXISTS target_name VARCHAR(255);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target ON activity_logs(target_type, target_id);

-- Update RLS policies to work with new schema
DROP POLICY IF EXISTS activity_logs_select_admin ON activity_logs;
CREATE POLICY activity_logs_select_admin ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS activity_logs_select_self ON activity_logs;
CREATE POLICY activity_logs_select_self ON activity_logs
  FOR SELECT USING (
    user_id = auth.uid() OR actor_id = auth.uid()
  );

DROP POLICY IF EXISTS activity_logs_admin_write ON activity_logs;
CREATE POLICY activity_logs_admin_write ON activity_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Add comment
COMMENT ON TABLE activity_logs IS 'Audit trail for all important actions in the system';
