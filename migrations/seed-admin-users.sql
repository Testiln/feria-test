-- Insert admin users with bcrypt hashed passwords
INSERT INTO admin_users (nombre, usuario, pwd, isActive) VALUES
('Administrador', 'admin', '$2a$10$wdMTIUd6gaci10NOxkl5C.AaDBzzE4H0QG3c5lpQ2jA3Rwn8ZSNWe', true),
('Manager', 'manager', '$2a$10$T/FZgba4twzXD38Xt6Y8XOJUit./XD8tysY6m2DxLcMriv3kQSSQy', true)
ON CONFLICT (usuario) DO NOTHING;
