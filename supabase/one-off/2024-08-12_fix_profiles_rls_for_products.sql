-- ============================================================================
-- One-time fix: Add public read policy for profiles referenced by active products
--
-- This allows public (unauthenticated) users to view basic dealer profile information
-- when the profile is referenced by an active product. This is necessary for the
-- product details page to show seller information to website visitors.
-- 
-- Run this in the Supabase SQL Editor for your project.
-- ============================================================================

-- Add policy to allow public read of profiles referenced by active products
CREATE POLICY profiles_public_read_for_active_products ON profiles
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.dealer_id = profiles.id 
      AND products.status = 'ACTIVE'
    )
    OR id = auth.uid() 
    OR is_admin()
  );

-- Verification query (read-only, safe to run before/after):
-- This should return profiles that are referenced by active products
-- SELECT p.* FROM public.profiles p
-- JOIN public.products pr ON pr.dealer_id = p.id
-- WHERE pr.status = 'ACTIVE'
-- LIMIT 5;
