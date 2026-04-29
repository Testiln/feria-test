-- Fix admin_users isActive field (SET DEFAULT and UPDATE existing nulls)
ALTER TABLE admin_users ALTER COLUMN isActive SET DEFAULT true;

UPDATE admin_users SET isActive = true WHERE isActive IS NULL;

-- Verify the fix
SELECT id, nombre, usuario, isActive FROM admin_users;
