# Configuración de Login Admin

## Descripción

Se ha configurado el sistema de login admin con autenticación basada en base de datos usando bcrypt para las contraseñas hasheadas.

## Cambios Realizados

### 1. **Tabla `admin_users` en la base de datos**
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  pwd TEXT NOT NULL,  -- Contraseña hasheada con bcrypt
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: ID único del admin
- `nombre`: Nombre completo del administrador
- `usuario`: Nombre de usuario (único)
- `pwd`: Contraseña hasheada con bcrypt (10 rounds)
- `isActive`: Estado del usuario (true/false)

### 2. **Instalación de Dependencias**
Se agregó `bcryptjs` al `package.json` para hashear y verificar contraseñas.

### 3. **Endpoint de Login**
Ubicación: `/src/app/api/admin/login/route.ts`

**Cambios:**
- Lee usuarios de la tabla `admin_users` en Supabase
- Valida que el usuario exista
- Verifica que esté activo (`isActive = true`)
- Compara contraseña con bcrypt
- Genera un token en base64 (userId:username)
- Establece cookie segura `admin-token` con expiración de 24h

### 4. **Validación de Admin**
Ubicación: `/src/lib/admin.ts`

**Cambios:**
- Función `validateAdminAuth()` ahora es **async**
- Decodifica el token y valida contra la BD
- Verifica que el usuario siga siendo activo
- Todos los endpoints admin ya han sido actualizados para usar `await`

### 5. **Usuarios de Prueba**
Archivo: `/migrations/seed-admin-users.sql`

Se crearon 2 usuarios de prueba con contraseñas hasheadas:
- **Usuario:** `admin` | **Contraseña:** `admin123`
- **Usuario:** `manager` | **Contraseña:** `manager123`

## Instalación

### Paso 1: Ejecutar las migraciones en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta el contenido de `schema.sql` primero (esto crea la tabla `admin_users`)
5. Luego ejecuta el contenido de `migrations/seed-admin-users.sql` (esto inserta los usuarios de prueba)

Alternativamente, si tienes acceso a la BD:
```bash
psql -U postgres -h [host] -d [database] -f schema.sql
psql -U postgres -h [host] -d [database] -f migrations/seed-admin-users.sql
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Asegúrate de que `.env.local` tenga:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Prueba del Sistema

### Acceder al Login
1. Ve a `http://localhost:3000/admin/login`
2. Ingresa credenciales:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. O usar el otro usuario:
   - Usuario: `manager`
   - Contraseña: `manager123`

### Verificar en Base de Datos
```sql
SELECT id, nombre, usuario, isActive FROM admin_users;
```

## Agregar Nuevos Usuarios Admin

### Opción 1: Desde SQL
```bash
node generate-admin-users.js  # Esto genera hashes
```

Luego copia el SQL generado en la consola de Supabase.

### Opción 2: Manualmente con bcryptjs
```javascript
const bcryptjs = require('bcryptjs')

// Generar hash
const hash = await bcryptjs.hash('tu_contraseña', 10)

// Insertar en BD
INSERT INTO admin_users (nombre, usuario, pwd, isActive) 
VALUES ('Nombre', 'username', '[hash_aqui]', true);
```

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Validación en base de datos (sin hardcoding)
- ✅ Cookie HTTP-only segura
- ✅ Validación de estado `isActive`
- ✅ Service role key para consultas de BD

## Estructura del Token

El token se codifica en base64 como:
```
base64([userId]:[username])
```

Ejemplo:
```
base64(123e4567-e89b-12d3-a456-426614174000:admin) = 
MTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwOmFkbWlu
```

## Problemas Comunes

### "Credenciales inválidas"
- Verifica que el usuario exista en `admin_users`
- Verifica que `isActive = true`
- Verifica que la contraseña sea correcta

### "Usuario inactivo"
- El usuario existe pero `isActive = false`
- Actualiza en BD: `UPDATE admin_users SET isActive = true WHERE usuario = 'username';`

### Error de conexión a BD
- Verifica `NEXT_PUBLIC_SUPABASE_URL` en `.env.local`
- Verifica `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- Asegúrate de que la tabla `admin_users` existe

## Funciones Relacionadas

- `POST /api/admin/login` - Login
- `GET /api/admin/me` - Obtener info del admin actual
- `POST /api/admin/logout` - Logout
- `validateAdminAuth()` - Validar token en endpoints

---

**Última actualización:** 28 de abril, 2026
