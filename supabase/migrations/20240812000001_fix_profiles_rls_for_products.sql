-- ============================================================================
-- Fix profiles RLS to allow public read for product dealer information
--
-- This adds a policy that allows public users to read basic dealer profile
-- information when the profile is referenced by an active product.
-- This is necessary because product details pages need to show seller information
-- to public (unauthenticated) users.
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
