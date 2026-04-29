-- Add price column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
