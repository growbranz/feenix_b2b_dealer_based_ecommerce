-- ============================================================================
-- Fix Orders Insert Policy for Sellers
-- The existing orders_insert_buyer policy only allows buyers to insert orders.
-- This adds a complementary policy to allow sellers to insert orders when they
-- are the seller_id, which is needed for the "Create Order from Enquiry" flow.
-- ============================================================================

DROP POLICY IF EXISTS orders_insert_seller ON orders;

CREATE POLICY orders_insert_seller ON orders
  FOR INSERT WITH CHECK (seller_id = auth.uid() OR is_admin());
