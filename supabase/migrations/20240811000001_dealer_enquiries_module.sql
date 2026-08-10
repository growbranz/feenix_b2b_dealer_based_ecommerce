-- ============================================================================
-- Dealer Enquiries Module
-- Additive-only migration. Preserves all existing enquiries columns
-- (buyer_id, seller_id, product_id, quantity, remarks, status, assigned_by,
-- created_at) and the existing enquiry_status enum values (PENDING,
-- ASSIGNED, ACCEPTED, REJECTED, COMPLETED) exactly as-is.
--
-- Quotation messaging deliberately reuses the existing messaging system
-- (conversations.context_type = 'enquiry', messages.message_type =
-- 'quotation') instead of a new quotes table.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Priority enum + column.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enquiry_priority') THEN
    CREATE TYPE enquiry_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  END IF;
END $$;

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS priority enquiry_priority NOT NULL DEFAULT 'MEDIUM';

-- ----------------------------------------------------------------------------
-- 2. updated_at (reuses the existing update_updated_at_column() trigger fn;
--    does not create a duplicate timestamp mechanism).
-- ----------------------------------------------------------------------------
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE enquiries SET updated_at = created_at WHERE updated_at IS NULL;

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. Nullable order_id link (set only by the explicit "Create Order" action,
--    never automatically on accept).
-- ----------------------------------------------------------------------------
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_enquiries_order_id ON enquiries(order_id);

-- ----------------------------------------------------------------------------
-- 4. Enquiry status history (drives the Enquiry Timeline UI). Mirrors the
--    order_status_history architecture exactly. No timeline data is stored
--    on the enquiries row itself.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enquiry_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  status enquiry_status NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiry_status_history_enquiry_id ON enquiry_status_history(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_status_history_created_at ON enquiry_status_history(created_at);

-- ----------------------------------------------------------------------------
-- 5. Helper: enquiry_is_visible(), mirroring the existing order_is_visible().
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION enquiry_is_visible(enquiry_row enquiries)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN enquiry_row.buyer_id = auth.uid() OR enquiry_row.seller_id = auth.uid() OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. Auto-log every status change (insert or update), same pattern as
--    log_order_status_change(). SECURITY DEFINER runs as the table owner,
--    which bypasses RLS for this system-maintained audit insert only.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_enquiry_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO enquiry_status_history (enquiry_id, status, actor_id, note)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Enquiry submitted');
  ELSIF (TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO enquiry_status_history (enquiry_id, status, actor_id, note)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status updated to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enquiries_log_status_change ON enquiries;
CREATE TRIGGER enquiries_log_status_change
  AFTER INSERT OR UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION log_enquiry_status_change();

-- ----------------------------------------------------------------------------
-- 7. RLS policies for enquiries. Currently RLS is enabled with ZERO
--    policies (confirmed live), so nothing below replaces an existing
--    policy of the same access model - these are the first real policies
--    for this table.
--
--    Access model:
--      - Admin: full access
--      - Buyer: can see/update their own enquiries
--      - Dealer: can see/update only enquiries where seller_id = auth.uid()
--      - No dealer can ever see another dealer's enquiries.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS enquiries_select_parties ON enquiries;
CREATE POLICY enquiries_select_parties ON enquiries
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS enquiries_insert_buyer ON enquiries;
CREATE POLICY enquiries_insert_buyer ON enquiries
  FOR INSERT WITH CHECK (buyer_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS enquiries_update_parties ON enquiries;
CREATE POLICY enquiries_update_parties ON enquiries
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

-- ----------------------------------------------------------------------------
-- 8. RLS for enquiry_status_history (read-only for the two parties/admin;
--    inserts only ever happen via the SECURITY DEFINER trigger above).
-- ----------------------------------------------------------------------------
ALTER TABLE enquiry_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS enquiry_status_history_select_visible ON enquiry_status_history;
CREATE POLICY enquiry_status_history_select_visible ON enquiry_status_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM enquiries e WHERE e.id = enquiry_id AND enquiry_is_visible(e)
  ));
