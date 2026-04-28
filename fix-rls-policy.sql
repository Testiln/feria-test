-- Agregar política INSERT faltante en la tabla users
-- Esto permite que nuevos usuarios se registren

CREATE POLICY "Anyone can create a user profile during signup" ON users
  FOR INSERT WITH CHECK (true);
