-- Add scheduling and additional fields to banners table
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS cta_label VARCHAR(255),
ADD COLUMN IF NOT EXISTS cta_link TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have default values
UPDATE banners 
SET start_date = NOW()::DATE, 
    end_date = (NOW() + INTERVAL '30 days')::DATE,
    created_at = NOW(),
    updated_at = NOW()
WHERE start_date IS NULL;

-- Create index for scheduling queries
CREATE INDEX IF NOT EXISTS idx_banners_scheduling ON banners(start_date, end_date, status);
