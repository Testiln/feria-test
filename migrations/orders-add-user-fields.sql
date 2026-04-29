-- Modify orders table to include user data directly
-- This allows orders to be created without pre-registered users

ALTER TABLE orders ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS document_id VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- Make user_id nullable since we'll have user data embedded in the order
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add created_at and updated_at if not present
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
