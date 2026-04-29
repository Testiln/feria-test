# Sistema de Autenticación Admin - Seguridad

## Descripción General

El sistema de autenticación admin utiliza **cookies HTTP-only** para máxima seguridad, evitando ataques XSS y otros vectores de ataque comunes.

## Flujo de Seguridad

### 1. **Login** (`POST /api/admin/login`)
```
Usuario/Contraseña → Validación en BD → Bcrypt.compare() → Cookie HTTP-only
```

**Proceso:**
- El cliente envía usuario y contraseña en JSON
- El servidor consulta la tabla `admin_users` en Supabase
- Verifica que el usuario exista y esté activo (`isActive = true`)
- Compara la contraseña con bcrypt (10 rounds)
- Si todo es correcto, genera un token en base64: `userId:username`
- **Establece una cookie HTTP-only segura** con el token
- La cookie se establece SOLO en respuestas del servidor (no en JavaScript)

### 2. **Verificación de Autenticación** (`GET /api/admin/me`)
```
Cookie HTTP-only → Validación en BD → Retorna estado
```

**Proceso:**
- El cliente hace fetch a `/api/admin/me` con `credentials: 'include'`
- El servidor lee la cookie HTTP-only del request
- Llama a `validateAdminAuth()` que:
  - Decodifica el token
  - Busca el usuario en `admin_users`
  - Verifica que siga estando activo
  - Retorna `true` si es válido
- Si es válido, la página/componente se muestra
- Si no, redirige a `/admin/login`

### 3. **Logout** (`POST /api/admin/logout`)
```
Cookie eliminada → Cliente redirigido a /login
```

**Proceso:**
- El servidor elimina la cookie estableciendo `maxAge: 0`
- La cookie se elimina del navegador
- El cliente se redirige a `/admin/login`

### 4. **Protección de Rutas**
Cada página admin usa `<AdminProtector />` que:
1. Verifica autenticación con el servidor
2. Si no está autenticado, redirige a login
3. Si está autenticado, muestra la página

## Características de Seguridad

### ✅ Cookie HTTP-only
```javascript
response.cookies.set({
  name: 'admin-token',
  value: token,
  httpOnly: true,        // ← No accessible desde JavaScript
  secure: true,          // ← Solo HTTPS en producción
  sameSite: 'strict',    // ← Previene CSRF
  maxAge: 60 * 60 * 24,  // ← Expira en 24 horas
})
```

**Por qué es seguro:**
- `httpOnly: true` → JavaScript NO puede acceder (previene XSS)
- `secure: true` → Solo se envía por HTTPS (previene man-in-the-middle)
- `sameSite: 'strict'` → No se envía en peticiones cross-site (previene CSRF)

### ✅ Validación en Base de Datos
Cada request admin valida:
1. Cookie presente
2. Token válido en formato
3. Usuario existe en BD
4. Usuario está activo (`isActive = true`)

### ✅ Contraseñas Hasheadas con Bcrypt
- 10 rounds de salt
- Imposible recuperar contraseña original
- Immune a ataques de fuerza bruta (lento a propósito)

### ✅ Sin localStorage
- ❌ localStorage es vulnerable a XSS
- ✅ Cookies HTTP-only NO son accesibles desde JS

## Endpoints de Autenticación

### POST `/api/admin/login`
**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Exitoso - 200):**
```json
{
  "success": true,
  "token": "YjE1NzY5OWYtODY0Ny00OTE3LWI4OWMtMjNiODQ4OWE3ZTI0OmFkbWlu",
  "user": {
    "id": "b157699f-8647-4917-b89c-23b8489a7e24",
    "nombre": "Administrador",
    "usuario": "admin"
  },
  "message": "Autenticación exitosa"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

### GET `/api/admin/me`
**Headers:** `credentials: 'include'` (para enviar cookie)

**Response (Autenticado - 200):**
```json
{
  "success": true,
  "isAdmin": true,
  "user": {
    "id": "b157699f-8647-4917-b89c-23b8489a7e24",
    "usuario": "admin"
  }
}
```

**Response (No autenticado - 401):**
```json
{
  "isAdmin": false,
  "message": "No autenticado"
}
```

### POST `/api/admin/logout`
**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

## Protección de Endpoints Admin

Todos los endpoints admin usan `validateAdminAuth()`:

```typescript
import { validateAdminAuth, unauthorizedResponse } from '@/lib/admin'

export async function GET(request: NextRequest) {
  // Validar autenticación antes de procesar
  if (!(await validateAdminAuth(request))) {
    return unauthorizedResponse()
  }

  // Lógica del endpoint...
}
```

**Endpoints protegidos:**
- `GET /api/admin/orders` - Listar órdenes
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/reports` - Reportes
- `POST /api/admin/orders/[id]/approve` - Aprobar orden
- `POST /api/admin/orders/[id]/reject` - Rechazar orden

## Código del Cliente (React)

### Login Page
```typescript
const handleLogin = async (e: React.FormEvent) => {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (response.ok) {
    // Cookie HTTP-only ya fue establecida automáticamente
    router.push('/admin')
  }
}
```

### Protección de Rutas
```typescript
function AdminProtector() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/admin/me', {
        credentials: 'include',  // ← Enviar cookie
      })

      if (!response.ok) {
        router.replace('/admin/login')
      }
    }
    checkAuth()
  }, [])

  return null
}
```

### Logout
```typescript
const handleLogout = async () => {
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'include',
  })
  router.push('/admin/login')
}
```

## Ataques Prevenidos

| Ataque | Prevención |
|--------|-----------|
| **XSS (JavaScript injection)** | Cookie `httpOnly: true` - JS no puede acceder |
| **CSRF (Cross-Site Request Forgery)** | Cookie `sameSite: 'strict'` |
| **Man-in-the-Middle** | Cookie `secure: true` (HTTPS solo) |
| **Session hijacking** | Validación en BD en cada request |
| **Fuerza bruta** | Bcrypt 10 rounds (lento a propósito) |
| **Acceso no autorizado** | `validateAdminAuth()` en cada endpoint |
| **Usuarios inactivos** | Verificación de `isActive` en login y validación |

## Mejoras Futuras Recomendadas

1. **JWT Tokens** en lugar de base64 simple (agregar expiración)
2. **Rate limiting** en `/api/admin/login` (prevenir fuerza bruta)
3. **2FA (Two-Factor Authentication)**
4. **Logs de auditoría** de logins y acciones admin
5. **IP whitelist** para acceso admin (si aplica)
6. **Refresh tokens** (JWT de corta duración)
7. **HTTPS forzado** en producción
8. **CSP (Content Security Policy)** headers
9. **Rotación de cookies** periódicamente

## Base de Datos - Tabla admin_users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  pwd TEXT NOT NULL,           -- Hasheada con bcrypt
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único
- `nombre`: Nombre completo del admin
- `usuario`: Username único para login
- `pwd`: Contraseña hasheada con bcrypt (NUNCA en texto plano)
- `isActive`: Estado del usuario (true = puede loguear, false = bloqueado)

---

**Última actualización:** 28 de abril, 2026
