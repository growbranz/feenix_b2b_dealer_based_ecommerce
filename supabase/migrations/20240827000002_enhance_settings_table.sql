-- Enhance settings table for comprehensive business configuration
-- This migration adds business-relevant settings while removing sensitive infrastructure settings

-- Drop the problematic single-row trigger first
DROP TRIGGER IF EXISTS ensure_single_settings_trigger ON settings;
DROP FUNCTION IF EXISTS ensure_single_settings_row();

-- Add new columns to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS support_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS support_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on settings (if not already enabled)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS settings_public_read ON settings;
DROP POLICY IF EXISTS settings_admin_all ON settings;

-- Create new RLS policies
-- Public can read settings (for frontend usage)
CREATE POLICY settings_public_read ON settings 
FOR SELECT TO public 
USING (true);

-- Only admins can modify settings
CREATE POLICY settings_admin_update ON settings 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

CREATE POLICY settings_admin_insert ON settings 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ADMIN'
  )
);

-- Insert default settings if table is empty
-- Use a CTE to handle the insert safely
WITH settings_check AS (
  SELECT COUNT(*) as count FROM settings
)
INSERT INTO settings (
  site_name,
  company_name,
  company_email,
  company_phone,
  company_address,
  gst_number,
  logo_url,
  support_email,
  support_phone,
  whatsapp_number,
  facebook_url,
  instagram_url,
  linkedin_url,
  seo_title,
  seo_description
)
SELECT 
  'Feenix Repair',
  'Feenix Repair',
  'info@feenixrepair.com',
  '+91 1800 123 4567',
  '123 Industrial Area, Phase 1',
  '07AABCU9607R1ZN',
  '',
  'support@feenixrepair.com',
  '+91 1800 123 4567',
  '+91 98765 43210',
  '',
  '',
  '',
  'Feenix Repair - Premium Mobile Repair Parts',
  'Your trusted source for quality mobile repair parts and accessories.'
WHERE (SELECT count FROM settings_check) = 0;
