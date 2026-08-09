-- ---------------------------------------------------------------------------
-- PAYMENT SYSTEM SCHEMA EXTENSIONS
-- ---------------------------------------------------------------------------

-- Extend existing payment_status enum with production states
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'CREATED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'AUTHORIZED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'CAPTURED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';

-- ---------------------------------------------------------------------------
-- PAYMENTS TABLE EXTENSIONS
-- ---------------------------------------------------------------------------
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gst DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS invoice_id UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_payments_dealer_id ON payments(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- INVOICES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title VARCHAR(500),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  hsn VARCHAR(50),
  gst_rate DECIMAL(5,2) DEFAULT 0,
  gst_amount DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  shipping DECIMAL(12,2) DEFAULT 0,
  subtotal DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'ISSUED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_dealer_id ON invoices(dealer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- PAYMENT AUDIT LOGS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_payment_id ON payment_audit_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_order_id ON payment_audit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_created_at ON payment_audit_logs(created_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;

-- Payments
DROP POLICY IF EXISTS "Admins manage all payments" ON payments;
CREATE POLICY "Admins manage all payments" ON payments
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN'));

DROP POLICY IF EXISTS "Dealers view own payments" ON payments;
CREATE POLICY "Dealers view own payments" ON payments
  FOR SELECT
  USING (auth.uid() = dealer_id);

DROP POLICY IF EXISTS "Customers view own payments" ON payments;
CREATE POLICY "Customers view own payments" ON payments
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Invoices
DROP POLICY IF EXISTS "Admins manage all invoices" ON invoices;
CREATE POLICY "Admins manage all invoices" ON invoices
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN'));

DROP POLICY IF EXISTS "Dealers view own invoices" ON invoices;
CREATE POLICY "Dealers view own invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = dealer_id);

DROP POLICY IF EXISTS "Customers view own invoices" ON invoices;
CREATE POLICY "Customers view own invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Audit logs
DROP POLICY IF EXISTS "Admins manage audit logs" ON payment_audit_logs;
CREATE POLICY "Admins manage audit logs" ON payment_audit_logs
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN'));

DROP POLICY IF EXISTS "Dealers view own audit logs" ON payment_audit_logs;
CREATE POLICY "Dealers view own audit logs" ON payment_audit_logs
  FOR SELECT
  USING (auth.uid() = dealer_id OR auth.uid() = customer_id);
