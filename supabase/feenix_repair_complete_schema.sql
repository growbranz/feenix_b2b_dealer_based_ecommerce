-- ============================================================================
-- Feenix Repair - Complete Supabase / PostgreSQL Schema
-- Generated from the existing application codebase.
-- Safe for a new/empty Supabase project.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('ADMIN', 'DEALER');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
CREATE TYPE enquiry_status AS ENUM ('PENDING', 'ASSIGNED', 'ACCEPTED', 'REJECTED', 'COMPLETED');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURNED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'CREATED', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE inventory_movement_type AS ENUM ('PURCHASE', 'SALE', 'RESERVATION', 'RELEASE', 'TRANSFER', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'LOST');
CREATE TYPE inventory_transfer_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
CREATE TYPE inventory_alert_level AS ENUM ('CRITICAL', 'LOW', 'RECOMMENDED');
CREATE TYPE inventory_reservation_status AS ENUM ('RESERVED', 'DEDUCTED', 'RELEASED', 'RETURNED');
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'support');
CREATE TYPE conversation_context_type AS ENUM ('enquiry', 'order', 'payment', 'profile');
CREATE TYPE message_type AS ENUM ('text', 'image', 'pdf', 'invoice', 'quotation', 'order_link', 'payment_link', 'location');

-- ----------------------------------------------------------------------------
-- 3. TABLES
-- ----------------------------------------------------------------------------

-- User profiles (linked to auth.users by id)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'DEALER',
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  gst_number VARCHAR(15),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),
  business_description TEXT,
  profile_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  status product_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  logo TEXT,
  status product_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status product_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  sku VARCHAR(255),
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  bulk_price DECIMAL(12, 2),
  stock INTEGER DEFAULT 0,
  minimum_order INTEGER DEFAULT 1,
  condition VARCHAR(50),
  quality VARCHAR(50),
  warranty VARCHAR(255),
  status product_status DEFAULT 'ACTIVE',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  remarks TEXT,
  status enquiry_status DEFAULT 'PENDING',
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  available_stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  low_stock_limit INTEGER DEFAULT 10,
  critical_stock_limit INTEGER DEFAULT 5,
  recommended_reorder_level INTEGER DEFAULT 20,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT inventory_location_check CHECK (
    (dealer_id IS NOT NULL AND warehouse_id IS NULL) OR
    (dealer_id IS NULL AND warehouse_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  order_id UUID,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  previous_quantity INTEGER NOT NULL,
  updated_quantity INTEGER NOT NULL,
  previous_reserved INTEGER DEFAULT 0,
  updated_reserved INTEGER DEFAULT 0,
  movement_type inventory_movement_type NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status inventory_reservation_status DEFAULT 'RESERVED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  shipping_charges DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  status order_status DEFAULT 'PENDING',
  payment_status payment_status DEFAULT 'PENDING',
  courier VARCHAR(255),
  tracking_number VARCHAR(255),
  expected_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order status history (drives the Dealer/Admin Order "Timeline" UI).
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (dispatch notes, dealer-uploaded invoices, etc.) attached to an
-- order. Kept separate from the admin-only-write `invoices` table so
-- dealers can attach their own documents without weakening invoices' RLS.
CREATE TABLE IF NOT EXISTS order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'OTHER' CHECK (type IN ('INVOICE', 'DISPATCH', 'OTHER')),
  name VARCHAR(255) NOT NULL,
  file_url TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  amount DECIMAL(12, 2) NOT NULL,
  gst DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  shipping DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'INR',
  invoice_id UUID,
  notes TEXT,
  status payment_status DEFAULT 'PENDING',
  payment_method VARCHAR(50),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  dealer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  title VARCHAR(500),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  hsn VARCHAR(50),
  gst_rate DECIMAL(5, 2) DEFAULT 0,
  gst_amount DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  shipping DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'ISSUED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign keys deferred to after orders creation
ALTER TABLE inventory_ledger
  ADD CONSTRAINT inventory_ledger_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE inventory_reservations
  ADD CONSTRAINT inventory_reservations_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  category VARCHAR(50),
  source VARCHAR(50),
  source_id UUID,
  link TEXT,
  data JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'information',
  is_read BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
  category VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, channel, category)
);

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  image TEXT NOT NULL,
  link TEXT,
  display_order INTEGER DEFAULT 0,
  status product_status DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS featured_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE (product_id)
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name VARCHAR(255) DEFAULT 'Feenix Repair',
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  whatsapp VARCHAR(20),
  logo TEXT,
  favicon TEXT
);

-- Conversation-based messaging (the schema actually used by lib/chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type conversation_type NOT NULL DEFAULT 'direct',
  title TEXT,
  context_type conversation_context_type,
  context_id UUID,
  last_message_preview TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  unread_count INTEGER NOT NULL DEFAULT 0,
  pinned_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ,
  last_delivered_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT,
  message_type message_type NOT NULL DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  UNIQUE (message_id, user_id)
);

CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + interval '10 seconds',
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  typing_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL DEFAULT 'Feenix Repair',
  sender_email TEXT NOT NULL DEFAULT 'noreply@feenixrepair.com',
  reply_to TEXT,
  company_logo TEXT,
  footer_content TEXT,
  primary_color TEXT DEFAULT '#f97316',
  secondary_color TEXT DEFAULT '#1e293b',
  provider TEXT NOT NULL DEFAULT 'resend',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  error_message TEXT,
  opened_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  template_key TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  last_checked_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  event TEXT NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  response_status INTEGER,
  response_body TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_preview TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT,
  method TEXT,
  status INTEGER,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  cron TEXT,
  interval_minutes INTEGER,
  job_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  status TEXT,
  metadata JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  status VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. INDEXES
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product_location_unique ON inventory(product_id, COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE UNIQUE INDEX IF NOT EXISTS idx_low_stock_alerts_product_location_unique ON low_stock_alerts(product_id, COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_brands_category_id ON brands(category_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_products_dealer_id ON products(dealer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_model_id ON products(model_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(display_order);
CREATE INDEX IF NOT EXISTS idx_enquiries_buyer_id ON enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_seller_id ON enquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON enquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_by ON enquiries(assigned_by);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);
CREATE INDEX IF NOT EXISTS idx_order_documents_order_id ON order_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_dealer_id ON payments(dealer_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_dealer_id ON invoices(dealer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_payment_id ON payment_audit_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_order_id ON payment_audit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_created_at ON payment_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_dealer_id ON inventory(dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_product_id ON inventory_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_dealer_id ON inventory_ledger(dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_order_id ON inventory_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_user_id ON inventory_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_movement_type ON inventory_ledger(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created_at ON inventory_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id ON inventory_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_status ON inventory_reservations(status);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_product_id ON inventory_transfers(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_from_dealer ON inventory_transfers(from_dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_to_dealer ON inventory_transfers(to_dealer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_from_warehouse ON inventory_transfers(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_to_warehouse ON inventory_transfers(to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_product_id ON low_stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_dealer_id ON low_stock_alerts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_is_read ON low_stock_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_alert_level ON low_stock_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_active ON warehouses(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source);
CREATE INDEX IF NOT EXISTS idx_notifications_archived ON notifications(archived_at);
CREATE INDEX IF NOT EXISTS idx_notifications_deleted ON notifications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_channel ON notification_preferences(user_id, channel);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);
CREATE INDEX IF NOT EXISTS idx_featured_products_display_order ON featured_products(display_order);
CREATE INDEX IF NOT EXISTS idx_conversations_context ON conversations(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_user ON conversation_participants(user_id, archived_at, pinned_at);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_conversation ON typing_indicators(conversation_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_conversation ON conversation_reports(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_integrations_key ON integrations(key);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_system_jobs_status ON system_jobs(status);
CREATE INDEX IF NOT EXISTS idx_system_jobs_scheduled ON system_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_created ON system_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_dealer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'DEALER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION order_is_visible(order_row orders)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN order_row.buyer_id = auth.uid() OR order_row.seller_id = auth.uid() OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION product_is_visible(product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_uuid AND (p.status = 'ACTIVE' OR p.dealer_id = auth.uid() OR is_admin())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. BUSINESS LOGIC FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION refresh_product_stock(product_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = COALESCE((SELECT SUM(available_stock) FROM inventory WHERE product_id = product_uuid), 0),
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
      ) VALUES (
        NEW.product_id, dealer_uuid, wh_uuid, alert_level, new_available, limit_value
      )
      ON CONFLICT (
        product_id,
        (COALESCE(dealer_id, '00000000-0000-0000-0000-000000000000'::uuid)),
        (COALESCE(warehouse_id, '00000000-0000-0000-0000-000000000000'::uuid))
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

CREATE TRIGGER inventory_changed
  AFTER INSERT OR UPDATE OR DELETE ON inventory
  FOR EACH ROW EXECUTE FUNCTION inventory_changed_trigger();

CREATE OR REPLACE FUNCTION ensure_product_inventory()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory (product_id, dealer_id, available_stock, reserved_stock, low_stock_limit)
  VALUES (NEW.id, NEW.dealer_id, NEW.stock, 0, 10)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_inventory_ensure
  AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION ensure_product_inventory();

CREATE OR REPLACE FUNCTION reserve_stock_for_order(order_uuid UUID, product_uuid UUID, qty INTEGER, seller_uuid UUID)
RETURNS void AS $$
DECLARE
  inv_record RECORD;
BEGIN
  SELECT * INTO inv_record FROM inventory
  WHERE product_id = product_uuid AND dealer_id = seller_uuid
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No inventory record found for product % and dealer %', product_uuid, seller_uuid;
  END IF;

  IF inv_record.available_stock < qty THEN
    RAISE EXCEPTION 'Insufficient stock for product %. Available: %, requested: %', product_uuid, inv_record.available_stock, qty;
  END IF;

  UPDATE inventory
  SET available_stock = available_stock - qty,
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
  SELECT * INTO res FROM inventory_reservations
  WHERE order_id = order_uuid AND status = 'RESERVED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO inv FROM inventory
  WHERE product_id = res.product_id AND dealer_id = res.dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found for reservation';
  END IF;

  UPDATE inventory
  SET reserved_stock = reserved_stock - res.quantity,
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
  SELECT * INTO res FROM inventory_reservations
  WHERE order_id = order_uuid AND status = 'RESERVED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO inv FROM inventory
  WHERE product_id = res.product_id AND dealer_id = res.dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found for reservation';
  END IF;

  UPDATE inventory
  SET available_stock = available_stock + res.quantity,
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
  SELECT * INTO res FROM inventory_reservations
  WHERE order_id = order_uuid AND status = 'DEDUCTED'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT * INTO inv FROM inventory
  WHERE product_id = res.product_id AND dealer_id = res.dealer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory not found for reservation';
  END IF;

  UPDATE inventory
  SET available_stock = available_stock + res.quantity,
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

CREATE OR REPLACE FUNCTION order_created_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO inventory_reservations (order_id, product_id, dealer_id, quantity, status)
  VALUES (NEW.id, NEW.product_id, NEW.seller_id, NEW.quantity, 'RESERVED');

  PERFORM reserve_stock_for_order(NEW.id, NEW.product_id, NEW.quantity, NEW.seller_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_created_stock
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION order_created_trigger();

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

CREATE TRIGGER orders_updated_stock
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION order_updated_trigger();

-- Automatically log every status change (insert or update) into
-- order_status_history so the Order Timeline UI is always accurate.
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

CREATE TRIGGER orders_log_status_change
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_reservations_updated_at BEFORE UPDATE ON inventory_reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_transfers_updated_at BEFORE UPDATE ON inventory_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_low_stock_alerts_updated_at BEFORE UPDATE ON low_stock_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_reports_updated_at BEFORE UPDATE ON conversation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON email_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON email_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Messaging triggers
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_preview = LEFT(NEW.content, 120),
      last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

CREATE OR REPLACE FUNCTION bump_participant_unread()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversation_participants
  SET unread_count = unread_count + 1,
      updated_at = NOW()
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bump_participant_unread
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION bump_participant_unread();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own_or_admin ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_insert_own_or_admin ON profiles
  FOR INSERT WITH CHECK (id = auth.uid() OR is_admin());
CREATE POLICY profiles_update_own_or_admin ON profiles
  FOR UPDATE USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());
CREATE POLICY profiles_delete_admin ON profiles
  FOR DELETE USING (is_admin());

-- Public catalog (admin manages, public can read active)
CREATE POLICY categories_public_read ON categories FOR SELECT TO public USING (status = 'ACTIVE' OR is_admin());
CREATE POLICY categories_admin_all ON categories FOR ALL TO authenticated USING (is_admin());

CREATE POLICY brands_public_read ON brands FOR SELECT TO public USING (status = 'ACTIVE' OR is_admin());
CREATE POLICY brands_admin_all ON brands FOR ALL TO authenticated USING (is_admin());

CREATE POLICY models_public_read ON models FOR SELECT TO public USING (status = 'ACTIVE' OR is_admin());
CREATE POLICY models_admin_all ON models FOR ALL TO authenticated USING (is_admin());

CREATE POLICY banners_public_read ON banners FOR SELECT TO public USING (status = 'ACTIVE' OR is_admin());
CREATE POLICY banners_admin_all ON banners FOR ALL TO authenticated USING (is_admin());

CREATE POLICY featured_products_public_read ON featured_products FOR SELECT TO public USING (true);
CREATE POLICY featured_products_admin_all ON featured_products FOR ALL TO authenticated USING (is_admin());

CREATE POLICY settings_public_read ON settings FOR SELECT TO public USING (true);
CREATE POLICY settings_admin_all ON settings FOR ALL TO authenticated USING (is_admin());

-- Products
CREATE POLICY products_public_read ON products
  FOR SELECT TO public USING (status = 'ACTIVE' OR dealer_id = auth.uid() OR is_admin());
CREATE POLICY products_dealer_insert ON products
  FOR INSERT TO authenticated WITH CHECK (dealer_id = auth.uid() OR is_admin());
CREATE POLICY products_dealer_update ON products
  FOR UPDATE TO authenticated USING (dealer_id = auth.uid() OR is_admin())
  WITH CHECK (dealer_id = auth.uid() OR is_admin());
CREATE POLICY products_dealer_delete ON products
  FOR DELETE TO authenticated USING (dealer_id = auth.uid() OR is_admin());

CREATE POLICY product_images_public_read ON product_images
  FOR SELECT TO public USING (product_is_visible(product_id));
CREATE POLICY product_images_dealer_write ON product_images
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM products WHERE id = product_id AND (dealer_id = auth.uid() OR is_admin()))
  );

-- Enquiries
CREATE POLICY enquiries_select_parties ON enquiries
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());
CREATE POLICY enquiries_insert_buyer ON enquiries
  FOR INSERT WITH CHECK (buyer_id = auth.uid() OR is_admin());
CREATE POLICY enquiries_update_parties ON enquiries
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

-- Orders
CREATE POLICY orders_select_parties ON orders
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());
CREATE POLICY orders_insert_buyer ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid() OR is_admin());
CREATE POLICY orders_update_parties ON orders
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin())
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid() OR is_admin());

-- Order items
CREATE POLICY order_items_select_visible ON order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND order_is_visible(o)
  ));
CREATE POLICY order_items_admin_write ON order_items
  FOR ALL TO authenticated USING (is_admin())
  WITH CHECK (is_admin());

-- Order status history
CREATE POLICY order_status_history_select_visible ON order_status_history
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND order_is_visible(o)
  ));

-- Order documents
CREATE POLICY order_documents_select_visible ON order_documents
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND order_is_visible(o)
  ));
CREATE POLICY order_documents_insert_seller ON order_documents
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM orders o WHERE o.id = order_id AND (o.seller_id = auth.uid() OR is_admin())
  ));

-- Payments
CREATE POLICY payments_select_parties ON payments
  FOR SELECT USING (dealer_id = auth.uid() OR customer_id = auth.uid() OR is_admin());
CREATE POLICY payments_admin_write ON payments
  FOR ALL TO authenticated USING (is_admin());

-- Invoices
CREATE POLICY invoices_select_parties ON invoices
  FOR SELECT USING (dealer_id = auth.uid() OR customer_id = auth.uid() OR is_admin());
CREATE POLICY invoices_admin_write ON invoices
  FOR ALL TO authenticated USING (is_admin());

-- Payment audit logs
CREATE POLICY payment_audit_logs_select_parties ON payment_audit_logs
  FOR SELECT USING (actor_id = auth.uid() OR is_admin());
CREATE POLICY payment_audit_logs_admin_write ON payment_audit_logs
  FOR ALL TO authenticated USING (is_admin());

-- Inventory
CREATE POLICY inventory_admin_all ON inventory FOR ALL TO authenticated USING (is_admin());
CREATE POLICY inventory_dealer_select ON inventory
  FOR SELECT USING (is_dealer() AND dealer_id = auth.uid());
CREATE POLICY inventory_dealer_insert ON inventory
  FOR INSERT TO authenticated WITH CHECK (is_dealer() AND dealer_id = auth.uid());
CREATE POLICY inventory_dealer_update ON inventory
  FOR UPDATE TO authenticated
  USING (is_dealer() AND dealer_id = auth.uid())
  WITH CHECK (is_dealer() AND dealer_id = auth.uid());

CREATE POLICY inventory_ledger_admin_all ON inventory_ledger FOR ALL TO authenticated USING (is_admin());
CREATE POLICY inventory_ledger_dealer_select ON inventory_ledger
  FOR SELECT USING (is_dealer() AND dealer_id = auth.uid());
CREATE POLICY inventory_ledger_dealer_insert ON inventory_ledger
  FOR INSERT TO authenticated WITH CHECK (is_dealer() AND dealer_id = auth.uid());

CREATE POLICY inventory_reservations_admin_all ON inventory_reservations FOR ALL TO authenticated USING (is_admin());
CREATE POLICY inventory_reservations_dealer_select ON inventory_reservations
  FOR SELECT USING (is_dealer() AND dealer_id = auth.uid());

CREATE POLICY inventory_transfers_admin_all ON inventory_transfers FOR ALL TO authenticated USING (is_admin());
CREATE POLICY inventory_transfers_dealer_select ON inventory_transfers
  FOR SELECT USING (is_dealer() AND (from_dealer_id = auth.uid() OR to_dealer_id = auth.uid()));
CREATE POLICY inventory_transfers_dealer_insert ON inventory_transfers
  FOR INSERT WITH CHECK (is_dealer() AND (from_dealer_id = auth.uid() OR to_dealer_id = auth.uid()));

CREATE POLICY low_stock_alerts_admin_all ON low_stock_alerts FOR ALL TO authenticated USING (is_admin());
CREATE POLICY low_stock_alerts_dealer_select ON low_stock_alerts
  FOR SELECT USING (is_dealer() AND dealer_id = auth.uid());
CREATE POLICY low_stock_alerts_dealer_write ON low_stock_alerts
  FOR INSERT, UPDATE, DELETE TO authenticated
  USING (is_dealer() AND dealer_id = auth.uid())
  WITH CHECK (is_dealer() AND dealer_id = auth.uid());

-- Warehouses
CREATE POLICY warehouses_admin_all ON warehouses FOR ALL TO authenticated USING (is_admin());

-- Notifications
CREATE POLICY notifications_select_self ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update_self ON notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_delete_self ON notifications FOR DELETE USING (user_id = auth.uid());
CREATE POLICY notifications_admin_all ON notifications FOR ALL TO authenticated USING (is_admin());

CREATE POLICY notification_preferences_self ON notification_preferences FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Chat
CREATE POLICY conversations_participants_select ON conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
  );
CREATE POLICY conversations_admin_select ON conversations
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY participants_select ON conversation_participants
  FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY participants_update_self ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY messages_select_participants ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
  );
CREATE POLICY messages_insert_sender ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
  );
CREATE POLICY messages_update_sender ON messages
  FOR UPDATE USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

CREATE POLICY read_receipts_select_participants ON message_read_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      JOIN messages m ON m.conversation_id = cp.conversation_id
      WHERE m.id = message_read_receipts.message_id AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY read_receipts_upsert_self ON message_read_receipts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY typing_select_participants ON typing_indicators
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = typing_indicators.conversation_id AND user_id = auth.uid())
  );
CREATE POLICY typing_upsert_self ON typing_indicators
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY presence_select_all ON user_presence FOR SELECT USING (true);
CREATE POLICY presence_upsert_self ON user_presence
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY reports_select_reporter ON conversation_reports
  FOR SELECT USING (reporter_id = auth.uid() OR is_admin());
CREATE POLICY reports_insert_reporter ON conversation_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid() OR is_admin());

-- Email / admin-only
CREATE POLICY email_templates_admin ON email_templates FOR ALL TO authenticated USING (is_admin());
CREATE POLICY email_settings_admin ON email_settings FOR ALL TO authenticated USING (is_admin());
CREATE POLICY email_logs_admin ON email_logs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY email_queue_admin ON email_queue FOR ALL TO authenticated USING (is_admin());

-- Integrations & platform
CREATE POLICY integrations_admin ON integrations FOR ALL TO authenticated USING (is_admin());
CREATE POLICY webhooks_admin ON webhooks FOR ALL TO authenticated USING (is_admin());
CREATE POLICY webhook_logs_admin ON webhook_logs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY api_keys_admin ON api_keys FOR ALL TO authenticated USING (is_admin());
CREATE POLICY api_key_usage_logs_admin ON api_key_usage_logs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY system_jobs_admin ON system_jobs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY scheduled_tasks_admin ON scheduled_tasks FOR ALL TO authenticated USING (is_admin());
CREATE POLICY system_audit_logs_admin ON system_audit_logs FOR ALL TO authenticated USING (is_admin());

-- Activity logs
CREATE POLICY activity_logs_select_self_or_admin ON activity_logs
  FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY activity_logs_admin_write ON activity_logs
  FOR ALL TO authenticated USING (is_admin());

-- ----------------------------------------------------------------------------
-- 8. STORAGE
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY chat_attachments_select_participants ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE (m.metadata->>'storage_path') = storage.objects.name AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY chat_attachments_insert_sender ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.role() = 'authenticated'
  );

-- Dealer logo storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('dealer-logos', 'dealer-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY dealer_logos_select_own ON storage.objects
  FOR SELECT USING (
    bucket_id = 'dealer-logos'
    AND auth.role() = 'authenticated'
    AND (auth.uid()::text = split_part(name, '/', 1) OR is_admin())
  );

CREATE POLICY dealer_logos_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dealer-logos'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY dealer_logos_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'dealer-logos'
    AND auth.role() = 'authenticated'
    AND (auth.uid()::text = split_part(name, '/', 1) OR is_admin())
  );

-- ----------------------------------------------------------------------------
-- 9. OPTIONAL: AUTO-CREATE PROFILE ON SIGN-UP
-- Uncomment the following if you want a profile row automatically created
-- for every new Supabase Auth user. The application currently expects the
-- caller to create the profile row, so this is provided only as a convenience.
-- ----------------------------------------------------------------------------
/*
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'DEALER'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
*/

-- ----------------------------------------------------------------------------
-- 10. SEED / REFERENCE DATA
-- ----------------------------------------------------------------------------
INSERT INTO public.email_settings (sender_name, sender_email, reply_to, provider, enabled)
VALUES ('Feenix Repair', 'noreply@feenixrepair.com', 'support@feenixrepair.com', 'resend', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.integrations (key, name, provider, is_active, status, config)
VALUES
  ('resend', 'Resend Email', 'resend', true, 'active', '{}'),
  ('razorpay', 'Razorpay Payments', 'razorpay', true, 'active', '{}'),
  ('supabase_storage', 'Supabase Storage', 'supabase', true, 'active', '{}'),
  ('google_analytics', 'Google Analytics', 'google', false, 'pending', '{}'),
  ('google_maps', 'Google Maps', 'google', false, 'pending', '{}'),
  ('cloudinary', 'Cloudinary', 'cloudinary', false, 'pending', '{}'),
  ('slack', 'Slack', 'slack', false, 'pending', '{}'),
  ('whatsapp', 'WhatsApp Business', 'whatsapp', false, 'pending', '{}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.scheduled_tasks (name, interval_minutes, job_type, payload)
VALUES
  ('daily_cleanup', 1440, 'cleanup', '{}'),
  ('weekly_reports', 10080, 'reports', '{}'),
  ('inventory_reconciliation', 60, 'inventory_sync', '{}'),
  ('log_cleanup', 10080, 'cleanup', '{}')
ON CONFLICT (name) DO NOTHING;
