-- ============================================================================
-- Fix Inventory Reservations Insert Policy for Orders Trigger
-- The orders_created_stock trigger inserts into inventory_reservations when an
-- order is created. This trigger runs without SECURITY DEFINER, so it uses
-- the invoker's RLS context. Dealers need to be able to insert reservations
-- when they create orders (as sellers).
-- ============================================================================

DROP POLICY IF EXISTS inventory_reservations_dealer_insert ON inventory_reservations;

CREATE POLICY inventory_reservations_dealer_insert ON inventory_reservations
  FOR INSERT TO authenticated
  WITH CHECK (is_dealer() AND dealer_id = auth.uid());
