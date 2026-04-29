-- Add user fields directly to orders table for when user is not authenticated
-- This allows storing order details even without a registered user

-- Alter orders table to make user_id nullable and add user fields
ALTER TABLE orders 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add user information columns if they don't exist
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS document_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- Update RLS policies for orders to allow admin operations
-- (These will be bypassed when using service_role_key)
