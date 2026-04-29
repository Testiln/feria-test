-- Add admin policies for orders management
-- This allows the admin to view and update all orders (when using service_role_key)

-- Allow service role (admin) to select all orders and related data
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own orders
CREATE POLICY "Users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own orders (for status changes)
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can do everything via service_role_key (RLS is bypassed)
-- So no additional policies needed for admin operations
