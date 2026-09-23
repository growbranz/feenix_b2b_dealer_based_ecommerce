-- Add icon and display_order fields to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Create index for display_order for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Add comment
COMMENT ON COLUMN categories.icon IS 'Icon identifier for category (e.g., camera, battery, monitor)';
COMMENT ON COLUMN categories.display_order IS 'Display order for sorting categories on public website';
