-- Add premium merchandising columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS premium BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_display_order INTEGER NOT NULL DEFAULT 0;

-- Create index for premium products
CREATE INDEX IF NOT EXISTS idx_products_premium ON products(premium);
CREATE INDEX IF NOT EXISTS idx_products_premium_display_order ON products(premium_display_order);

-- Add comment for documentation
COMMENT ON COLUMN products.premium IS 'Flag to mark products as premium for homepage showcase';
COMMENT ON COLUMN products.premium_display_order IS 'Display order for premium products (lower values appear first)';
