-- Inventory Synchronization System Migration
-- Extends the existing schema with ledger, transfers, alerts, warehouses,
-- order lifecycle triggers, and location-aware inventory.

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_movement_type') THEN
    CREATE TYPE inventory_movement_type AS ENUM (
      'PURCHASE', 'SALE', 'RESERVATION', 'RELEASE', 'TRANSFER',
      'ADJUSTMENT', 'RETURN', 'DAMAGE', 'LOST'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_transfer_status') THEN
    CREATE TYPE inventory_transfer_status AS ENUM (
      'PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_alert_level') THEN
    CREATE TYPE inventory_alert_level AS ENUM (
      'CRITICAL', 'LOW', 'RECOMMENDED'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_reservation_status') THEN
    CREATE TYPE inventory_reservation_status AS ENUM (
      'RESERVED', 'DEDUCTED', 'RELEASED', 'RETURNED'
    );
  END IF;
END$$;

-- ---------------------------------------------------------------------------
-- PRODUCT SKU SUPPORT
-- ---------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ---------------------------------------------------------------------------
-- WAREHOUSES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_is_active ON warehouses(is_active);

-- ---------------------------------------------------------------------------
-- INVENTORY LOCATION SUPPORT
-- ---------------------------------------------------------------------------
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS dealer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS critical_stock_limit INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS recommended_reorder_level INTEGER DEFAULT 20;

-- Backfill existing inventory rows with their product owner as the dealer location.
UPDATE inventory i
SET dealer_id = p.dealer_id
FROM products p
WHERE i.product_id = p.id AND i.dealer_id IS NULL AND i.warehouse_id IS NULL;

-- A row must represent exactly one location.
ALTER TABLE inventory
  ADD CONSTRAINT inventory_location_check
    CHECK (
      (dealer_id IS NOT NULL AND warehouse_id IS NULL) OR
      (dealer_id IS NULL AND warehouse_id IS NOT NULL)
    );

-- Replace the single-product unique with a location-aware unique.
DROP INDEX IF EXISTS idx_inventory_product_id_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_location_unique
  ON inventory(
    product_id,
    COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

CREATE INDEX IF NOT EXISTS idx_inventory_dealer_id ON inventory(dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);

-- ---------------------------------------------------------------------------
-- INVENTORY LEDGER (immutable stock history)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  previous_quantity INTEGER NOT NULL,
  updated_quantity INTEGER NOT NULL,
  previous_reserved INTEGER DEFAULT 0,
  updated_reserved INTEGER DEFAULT 0,
  movement_type inventory_movement_type NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_ledger_product_id ON inventory_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_dealer_id ON inventory_ledger(dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_order_id ON inventory_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_user_id ON inventory_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_movement_type ON inventory_ledger(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created_at ON inventory_ledger(created_at);

-- ---------------------------------------------------------------------------
-- INVENTORY RESERVATIONS (order-level reservation state)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status inventory_reservation_status DEFAULT 'RESERVED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id ON inventory_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON inventory_reservations(status);

-- ---------------------------------------------------------------------------
-- INVENTORY TRANSFERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  from_dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  from_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  to_dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status inventory_transfer_status DEFAULT 'PENDING',
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_inventory_transfers_product_id ON inventory_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_from_dealer ON inventory_transfers(from_dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_to_dealer ON inventory_transfers(to_dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_from_warehouse ON inventory_transfers(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_to_warehouse ON inventory_transfers(to_warehouse_id);

-- ---------------------------------------------------------------------------
-- LOW STOCK ALERTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  alert_level inventory_alert_level NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  threshold INTEGER NOT NULL DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_product_id ON low_stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_dealer_id ON low_stock_alerts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_is_read ON low_stock_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_alert_level ON low_stock_alerts(alert_level);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Helper: current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: current user is a dealer
CREATE OR REPLACE FUNCTION is_dealer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'DEALER'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admin warehouses full access"
  ON warehouses FOR ALL
  USING (is_admin());

CREATE POLICY "Admin inventory ledger full access"
  ON inventory_ledger FOR ALL
  USING (is_admin());

CREATE POLICY "Dealer ledger read own"
  ON inventory_ledger FOR SELECT
  USING (is_dealer() AND dealer_id = auth.uid());

CREATE POLICY "Admin reservations full access"
  ON inventory_reservations FOR ALL
  USING (is_admin());

CREATE POLICY "Dealer reservations read own"
  ON inventory_reservations FOR SELECT
  USING (is_dealer() AND dealer_id = auth.uid());

CREATE POLICY "Admin transfers full access"
  ON inventory_transfers FOR ALL
  USING (is_admin());

CREATE POLICY "Dealer transfers access"
  ON inventory_transfers FOR ALL
  USING (
    is_dealer() AND
    (from_dealer_id = auth.uid() OR to_dealer_id = auth.uid())
  );

CREATE POLICY "Admin alerts full access"
  ON low_stock_alerts FOR ALL
  USING (is_admin());

CREATE POLICY "Dealer alerts read own"
  ON low_stock_alerts FOR SELECT
  USING (is_dealer() AND dealer_id = auth.uid());

-- ---------------------------------------------------------------------------
-- DENORMALIZED PRODUCT STOCK
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_product_stock(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = (
    SELECT COALESCE(SUM(available_stock), 0)
    FROM inventory
    WHERE product_id = product_uuid
  ),
  updated_at = NOW()
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION inventory_changed_trigger()
RETURNS TRIGGER AS $$
DECLARE
  product_uuid UUID;
  new_available INTEGER;
  new_reserved INTEGER;
  limit_value INTEGER;
  dealer_uuid UUID;
  wh_uuid UUID;
  alert_level inventory_alert_level;
BEGIN
  IF TG_OP = 'DELETE' THEN
    product_uuid := OLD.product_id;
  ELSE
    product_uuid := NEW.product_id;
  END IF;

  PERFORM refresh_product_stock(product_uuid);

  IF TG_OP != 'DELETE' THEN
    new_available := NEW.available_stock;
    new_reserved := NEW.reserved_stock;
    limit_value := NEW.low_stock_limit;
    dealer_uuid := NEW.dealer_id;
    wh_uuid := NEW.warehouse_id;

    IF new_available = 0 THEN
      alert_level := 'CRITICAL';
    ELSIF new_available <= limit_value THEN
      alert_level := 'LOW';
    ELSIF new_available <= NEW.recommended_reorder_level THEN
      alert_level := 'RECOMMENDED';
    ELSE
      alert_level := NULL;
    END IF;

    IF alert_level IS NOT NULL THEN
      INSERT INTO low_stock_alerts (
        product_id, dealer_id, warehouse_id, alert_level, current_stock, threshold
      )
      VALUES (
        NEW.product_id, dealer_uuid, wh_uuid, alert_level, new_available, limit_value
      )
      ON CONFLICT (
        product_id,
        COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid)
      )
      DO UPDATE SET
        alert_level = EXCLUDED.alert_level,
        current_stock = EXCLUDED.current_stock,
        threshold = EXCLUDED.threshold,
        is_read = false,
        updated_at = NOW();
    ELSE
      DELETE FROM low_stock_alerts
      WHERE product_id = NEW.product_id
        AND COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid) =
            COALESCE(dealer_uuid, '00000000-0000-0000-0000-000000000000'::uuid)
        AND COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid) =
            COALESCE(wh_uuid, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER inventory_changed
  AFTER INSERT OR UPDATE OR DELETE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION inventory_changed_trigger();

-- ---------------------------------------------------------------------------
-- PRODUCT -> INVENTORY SYNC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ensure_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (
    product_id, dealer_id, available_stock, reserved_stock, low_stock_limit
  )
  VALUES (NEW.id, NEW.dealer_id, NEW.stock, 0, 10)
  ON CONFLICT (
    product_id,
    COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER products_inventory_ensure
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION ensure_product_inventory();

-- ---------------------------------------------------------------------------
-- ORDER LIFECYCLE STOCK FUNCTIONS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reserve_stock_for_order(
  order_uuid UUID,
  product_uuid UUID,
  qty INTEGER,
  seller_uuid UUID
)
RETURNS void AS $$
DECLARE
  inv_record RECORD;
BEGIN
  SELECT * INTO inv_record
  FROM inventory
  WHERE product_id = product_uuid AND dealer_id = seller_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No inventory record found for product % and dealer %', product_uuid, seller_uuid;
  END IF;

  IF inv_record.available_stock < qty THEN
    RAISE EXCEPTION 'Insufficient stock for product %. Available: %, requested: %',
      product_uuid, inv_record.available_stock, qty;
  END IF;

  UPDATE inventory
  SET
    available_stock = available_stock - qty,
    reserved_stock = reserved_stock + qty,
    updated_at = NOW()
  WHERE id = inv_record.id;

  INSERT INTO inventory_ledger (
    product_id, dealer_id, order_id, previous_quantity, updated_quantity,
    previous_reserved, updated_reserved, movement_type, reason
  ) VALUES (
    product_uuid, seller_uuid, order_uuid,
    inv_record.available_stock, inv_record.available_stock - qty,
    inv_record.reserved_stock, inv_record.reserved_stock + qty,
    'RESERVATION', 'Order created - stock reserved'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deduct_reserved_stock(order_uuid UUID)
RETURNS void AS $$
DECLARE
  res RECORD;
  inv RECORD;
BEGIN
  SELECT * INTO res
  FROM inventory_reservations
  WHERE order_id = order_uuid AND status = 'RESERVED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO inv
  FROM inventory
  WHERE product_id = res.product_id AND dealer_id = res.dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found for reservation';
  END IF;

  UPDATE inventory
  SET
    reserved_stock = reserved_stock - res.quantity,
    updated_at = NOW()
  WHERE id = inv.id;

  UPDATE inventory_reservations
  SET status = 'DEDUCTED', updated_at = NOW()
  WHERE id = res.id;

  INSERT INTO inventory_ledger (
    product_id, dealer_id, order_id, previous_quantity, updated_quantity,
    previous_reserved, updated_reserved, movement_type, reason
  ) VALUES (
    res.product_id, res.dealer_id, order_uuid,
    inv.available_stock, inv.available_stock,
    inv.reserved_stock, inv.reserved_stock - res.quantity,
    'SALE', 'Payment successful - stock deducted'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_reserved_stock(order_uuid UUID, reason_text TEXT)
RETURNS void AS $$
DECLARE
  res RECORD;
  inv RECORD;
BEGIN
  SELECT * INTO res
  FROM inventory_reservations
  WHERE order_id = order_uuid AND status = 'RESERVED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO inv
  FROM inventory
  WHERE product_id = res.product_id AND dealer_id = res.dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found for reservation';
  END IF;

  UPDATE inventory
  SET
    available_stock = available_stock + res.quantity,
    reserved_stock = reserved_stock - res.quantity,
    updated_at = NOW()
  WHERE id = inv.id;

  UPDATE inventory_reservations
  SET status = 'RELEASED', updated_at = NOW()
  WHERE id = res.id;

  INSERT INTO inventory_ledger (
    product_id, dealer_id, order_id, previous_quantity, updated_quantity,
    previous_reserved, updated_reserved, movement_type, reason
  ) VALUES (
    res.product_id, res.dealer_id, order_uuid,
    inv.available_stock, inv.available_stock + res.quantity,
    inv.reserved_stock, inv.reserved_stock - res.quantity,
    'RELEASE', reason_text
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION return_deducted_stock(order_uuid UUID, reason_text TEXT)
RETURNS void AS $$
DECLARE
  res RECORD;
  inv RECORD;
BEGIN
  SELECT * INTO res
  FROM inventory_reservations
  WHERE order_id = order_uuid AND status = 'DEDUCTED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO inv
  FROM inventory
  WHERE product_id = res.product_id AND dealer_id = res.dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found for reservation';
  END IF;

  UPDATE inventory
  SET
    available_stock = available_stock + res.quantity,
    updated_at = NOW()
  WHERE id = inv.id;

  UPDATE inventory_reservations
  SET status = 'RETURNED', updated_at = NOW()
  WHERE id = res.id;

  INSERT INTO inventory_ledger (
    product_id, dealer_id, order_id, previous_quantity, updated_quantity,
    previous_reserved, updated_reserved, movement_type, reason
  ) VALUES (
    res.product_id, res.dealer_id, order_uuid,
    inv.available_stock, inv.available_stock + res.quantity,
    inv.reserved_stock, inv.reserved_stock,
    'RETURN', reason_text
  );
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- ORDER TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION order_created_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory_reservations (
    order_id, product_id, dealer_id, quantity, status
  )
  VALUES (
    NEW.id, NEW.product_id, NEW.seller_id, NEW.quantity, 'RESERVED'
  );

  PERFORM reserve_stock_for_order(NEW.id, NEW.product_id, NEW.quantity, NEW.seller_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_created_stock
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION order_created_trigger();

CREATE OR REPLACE FUNCTION order_updated_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
    PERFORM release_reserved_stock(NEW.id, 'Order cancelled');
    PERFORM return_deducted_stock(NEW.id, 'Order cancelled - stock returned');
  ELSIF NEW.payment_status = 'PAID' AND OLD.payment_status != 'PAID' THEN
    PERFORM deduct_reserved_stock(NEW.id);
  ELSIF NEW.payment_status = 'FAILED' AND OLD.payment_status != 'FAILED' THEN
    PERFORM release_reserved_stock(NEW.id, 'Payment failed - stock released');
  ELSIF NEW.payment_status = 'REFUNDED' AND OLD.payment_status != 'REFUNDED' THEN
    PERFORM return_deducted_stock(NEW.id, 'Refund processed - stock returned');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER orders_updated_stock
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION order_updated_trigger();

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_reservations_updated_at
  BEFORE UPDATE ON inventory_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_transfers_updated_at
  BEFORE UPDATE ON inventory_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_low_stock_alerts_updated_at
  BEFORE UPDATE ON low_stock_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
