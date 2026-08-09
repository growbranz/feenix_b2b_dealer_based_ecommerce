-- Seed Demo Users for Testing
-- This migration creates demo Admin and Dealer accounts

-- Note: These users need to be created in Supabase Authentication first
-- Run the following SQL in Supabase SQL Editor or use the Supabase Dashboard to create the auth users

-- After creating auth users, insert their profiles with roles

-- Insert Admin Profile (email: admin@feenixrepair.com)
-- Replace <admin-auth-uuid> with the actual UUID from Supabase Auth
INSERT INTO profiles (id, role, name, email, phone, business_name, gst_number, address, city, state, country, pincode, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADMIN',
  'Admin User',
  'admin@feenixrepair.com',
  '+919876543210',
  'Feenix Repair',
  'GSTIN12345678',
  '123 Business Street',
  'Mumbai',
  'Maharashtra',
  'India',
  '400001',
  true
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = true;

-- Insert Dealer Profile (email: dealer@feenixrepair.com)
-- Replace <dealer-auth-uuid> with the actual UUID from Supabase Auth
INSERT INTO profiles (id, role, name, email, phone, business_name, gst_number, address, city, state, country, pincode, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'DEALER',
  'Demo Dealer',
  'dealer@feenixrepair.com',
  '+919876543211',
  'Demo Electronics',
  'GSTIN87654321',
  '456 Market Road',
  'Delhi',
  'Delhi',
  'India',
  '110001',
  true
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  is_active = true;

-- Insert sample category for testing
INSERT INTO categories (name, slug, description, status)
VALUES (
  'Displays',
  'displays',
  'Mobile phone display assemblies and screens',
  'ACTIVE'
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample brand for testing
INSERT INTO brands (category_id, name, slug, status)
SELECT 
  (SELECT id FROM categories WHERE slug = 'displays'),
  'Apple',
  'apple',
  'ACTIVE'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample model for testing
INSERT INTO models (brand_id, name, slug, status)
SELECT 
  (SELECT id FROM brands WHERE slug = 'apple'),
  'iPhone 14 Pro',
  'iphone-14-pro',
  'ACTIVE'
ON CONFLICT (slug) DO NOTHING;
