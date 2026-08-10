-- ============================================================================
-- Dealer Orders Module
-- Additive-only migration: extends existing orders/order_items with the
-- fields needed for the Dealer Orders UI, and adds two new tables
-- (order_status_history, order_documents) instead of touching the
-- admin-only-write `payments`/`invoices` tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend order_status enum with the remaining required states.
--    (Each ADD VALUE must not be referenced later in this same transaction.)
-- ----------------------------------------------------------------------------
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'PACKED' AFTER 'PROCESSING';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'COMPLETED' AFTER 'DELIVERED';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'RETURNED' AFTER 'CANCELLED';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'REFUNDED' AFTER 'RETURNED';

-- ----------------------------------------------------------------------------
-- 2. Extend orders with updated_at, discount/shipping and courier/tracking.
-- ----------------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_charges DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expected_delivery DATE;

UPDATE orders SET updated_at = created_at WHERE updated_at IS NULL;

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. Extend order_items with a discount column (unused today, kept for
--    forward-compatibility with multi-item orders).
-- ----------------------------------------------------------------------------
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS discount DECIMAL(12, 2) DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 4. Order status history (drives the "Order Timeline" UI).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_status_history_select_visible ON order_status_history;
CREATE POLICY order_status_history_select_visible ON order_status_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND order_is_visible(o)
  ));

-- Automatically log every status change (insert or update) so the timeline
-- is always accurate even if a caller forgets to log it manually.
-- SECURITY DEFINER means it runs as the table owner and bypasses the
-- (non-existent) direct-insert policy on this table, similar to other
-- system-maintained audit tables in this schema (e.g. payment_audit_logs).
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO order_status_history (order_id, status, actor_id, note)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Order placed');
  ELSIF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO order_status_history (order_id, status, actor_id, note)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status updated to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS orders_log_status_change ON orders;
CREATE TRIGGER orders_log_status_change
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ----------------------------------------------------------------------------
-- 5. Order documents (dispatch notes / invoices attached by the dealer).
--    Kept separate from the admin-only `invoices` table so dealers can
--    attach their own documents without weakening invoices' RLS.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'OTHER' CHECK (type IN ('INVOICE', 'DISPATCH', 'OTHER')),
  name VARCHAR(255) NOT NULL,
  file_url TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_documents_order_id ON order_documents(order_id);

ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_documents_select_visible ON order_documents;
CREATE POLICY order_documents_select_visible ON order_documents
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND order_is_visible(o)
  ));

DROP POLICY IF EXISTS order_documents_insert_seller ON order_documents;
CREATE POLICY order_documents_insert_seller ON order_documents
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND (o.seller_id = auth.uid() OR is_admin())
  ));
