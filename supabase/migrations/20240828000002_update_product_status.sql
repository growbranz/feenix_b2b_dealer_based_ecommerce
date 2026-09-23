-- Update product status enum for approval workflow
-- This migration replaces the old product_status enum with new approval workflow statuses

-- Create new product_status enum with approval workflow statuses
CREATE TYPE product_status_new AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'INACTIVE', 'SUSPENDED');

-- Add rejection_reason column for rejected products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add approved_at column to track when product was approved
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add submitted_at column to track when product was submitted for approval
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Create index for new status (will be added after migration)
-- CREATE INDEX idx_products_status_new ON products(status_new);

-- Migrate existing data:
-- - Existing ACTIVE products should become APPROVED
-- - Existing INACTIVE products should become INACTIVE
-- - Existing OUT_OF_STOCK products should become APPROVED (stock level is separate from approval status)
ALTER TABLE products
  ALTER COLUMN status TYPE product_status_new
  USING 
    CASE status
      WHEN 'ACTIVE' THEN 'APPROVED'::product_status_new
      WHEN 'INACTIVE' THEN 'INACTIVE'::product_status_new
      WHEN 'OUT_OF_STOCK' THEN 'APPROVED'::product_status_new
    END;

-- Set approved_at for existing APPROVED products
UPDATE products
SET approved_at = created_at
WHERE status = 'APPROVED' AND approved_at IS NULL;

-- Drop old enum type (PostgreSQL doesn't allow dropping types in use, so we rename)
-- ALTER TYPE product_status RENAME TO product_status_old;
-- ALTER TYPE product_status_new RENAME TO product_status;

-- For now, we'll keep both enums and the column uses the new one
-- The old enum can be dropped manually after confirming everything works

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Add comment
COMMENT ON COLUMN products.status IS 'Product approval status: DRAFT (being created), PENDING_APPROVAL (awaiting admin review), APPROVED (live on site), REJECTED (rejected by admin), INACTIVE (disabled), SUSPENDED (temporarily suspended)';
COMMENT ON COLUMN products.rejection_reason IS 'Reason for product rejection';
COMMENT ON COLUMN products.approved_at IS 'Timestamp when product was approved';
COMMENT ON COLUMN products.submitted_at IS 'Timestamp when product was submitted for approval';
