-- Add holiday column to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS holiday DATE;

-- Add comment to explain the column
COMMENT ON COLUMN shops.holiday IS 'Holiday date for the shop (YYYY-MM-DD format)'; 