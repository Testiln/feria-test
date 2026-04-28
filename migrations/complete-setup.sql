-- Complete Database Setup for Dashboard Feria
-- Execute this in Supabase SQL Editor

-- 1. Add user data columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS document_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS position VARCHAR(255);

-- Make user_id nullable to allow orders without registered users
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add price column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_document_id ON public.orders(document_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 4. Ensure RLS policy exists for users table (should already exist)
-- This policy allows anyone to create a user during signup
-- If it doesn't exist, the INSERT operations will fail
CREATE POLICY "Anyone can create a user profile during signup" 
ON public.users FOR INSERT 
WITH CHECK (true)
CREATED_IF_NOT_EXISTS = true;
