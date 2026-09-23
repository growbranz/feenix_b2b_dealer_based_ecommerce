-- Create marketplace_stats table for managing public website statistics
CREATE TABLE IF NOT EXISTS marketplace_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_stats_display_order ON marketplace_stats(display_order);
CREATE INDEX IF NOT EXISTS idx_marketplace_stats_is_active ON marketplace_stats(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_stats_stat_key ON marketplace_stats(stat_key);

-- Enable Row Level Security
ALTER TABLE marketplace_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Public users can read active marketplace stats
CREATE POLICY marketplace_stats_select_public ON marketplace_stats
  FOR SELECT USING (is_active = true);

-- Policy: Admins can read all marketplace stats
CREATE POLICY marketplace_stats_select_admin ON marketplace_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Admins can insert marketplace stats
CREATE POLICY marketplace_stats_insert_admin ON marketplace_stats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Admins can update marketplace stats
CREATE POLICY marketplace_stats_update_admin ON marketplace_stats
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Admins can delete marketplace stats
CREATE POLICY marketplace_stats_delete_admin ON marketplace_stats
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER marketplace_stats_updated_at_trigger
  BEFORE UPDATE ON marketplace_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_stats_updated_at();

-- Insert default marketplace statistics
INSERT INTO marketplace_stats (stat_key, value, label, icon, display_order, is_active) VALUES
  ('products_listed', '25K+', 'Products Listed', 'package', 1, true),
  ('verified_dealers', '5K+', 'Verified Dealers', 'users', 2, true),
  ('brands', '100+', 'Brands', 'award', 3, true),
  ('secure_transactions', '99.9%', 'Secure Transactions', 'shield-check', 4, true),
  ('marketplace_support', '24/7', 'Marketplace Support', 'headphones', 5, true)
ON CONFLICT (stat_key) DO NOTHING;

-- Add comment
COMMENT ON TABLE marketplace_stats IS 'Statistics displayed on the public website, managed by admins';
