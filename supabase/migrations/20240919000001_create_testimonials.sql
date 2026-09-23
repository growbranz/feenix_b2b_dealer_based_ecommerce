-- Create testimonials table for managing customer testimonials on the public website
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_role TEXT,
  company_name TEXT,
  testimonial_text TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Public users can read active testimonials only
CREATE POLICY testimonials_select_public ON testimonials
  FOR SELECT USING (is_active = true);

-- Policy: Admins can read all testimonials
CREATE POLICY testimonials_select_admin ON testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Admins can insert testimonials
CREATE POLICY testimonials_insert_admin ON testimonials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Admins can update testimonials
CREATE POLICY testimonials_update_admin ON testimonials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Admins can delete testimonials
CREATE POLICY testimonials_delete_admin ON testimonials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER testimonials_updated_at_trigger
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();

-- Insert initial testimonials
INSERT INTO testimonials (customer_name, customer_role, company_name, testimonial_text, rating, display_order, is_active) VALUES
  ('Rahul Sharma', 'Founder', 'TechFix Mobile Solutions', 'Feenix Repair transformed how we source mobile spare parts. The verified dealer network, fast delivery, and secure payments have helped us scale our repair business across three cities.', 5, 1, true),
  ('Priya Patel', 'Operations Manager', 'QuickFix Services', 'The platform has streamlined our entire procurement process. We now have access to genuine parts at competitive prices, and the dealer verification gives us peace of mind.', 5, 2, true),
  ('Amit Kumar', 'CEO', 'MobileCare Solutions', 'Outstanding service and reliability. Feenix Repair has become our go-to platform for sourcing quality mobile components. The support team is always responsive.', 5, 3, true)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE testimonials IS 'Customer testimonials displayed on the public website, managed by admins';
