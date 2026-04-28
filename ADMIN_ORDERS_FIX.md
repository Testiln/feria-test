# 🔧 INSTRUCCIONES CRÍTICAS - Actualización Admin Orders

## Problemas Solucionados

1. ✅ **"No disponible" en nombre y cédula** → Ahora usa `supabaseAdmin` que bypasea las políticas RLS
2. ✅ **Órdenes no se persistían en BD** → Ahora usa `supabaseAdmin` para updates
3. ✅ **Validación de admin** → Agregada en todos los endpoints

## Cambios de Código Realizados

### 1. Nuevo archivo: `/src/lib/admin.ts`
- Helper para validar cookies de admin
- Función `validateAdminAuth()` y `unauthorizedResponse()`

### 2. Nuevos endpoints:
- `/api/admin/orders/[id]/approve` - Aprueba orden con validación
- `/api/admin/orders/[id]/reject` - Rechaza orden con validación

### 3. Endpoints actualizados:
- `/api/admin/orders` - Usa `supabaseAdmin` y valida admin
- `/api/admin/reports` - Usa `supabaseAdmin` y valida admin
- Queries actualizadas con relaciones correctas (sin usar `!orders_user_id_fkey`)

### 4. Schema actualizado:
- Agregada política de UPDATE para órdenes en `schema.sql`
- Nueva migración en `/migrations/add-admin-policies.sql`

## ✋ PASO IMPORTANTE - Actualizar Supabase

### Opción A: Ejecutar el SQL en Supabase Console (RECOMENDADO)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Abre **SQL Editor**
4. Copia y ejecuta el siguiente SQL:

```sql
-- Recrear políticas de órdenes
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);
```

### Opción B: Usando el archivo de migración

Si tienes acceso a CLI de Supabase:
```bash
supabase db push
```

## 🧪 Cómo Probar

### 1. Asegúrate de que la cookie de admin esté configurada
- Login como admin desde `/admin/login`
- Usuario: `admin`
- Contraseña: `admin`

### 2. Prueba el listado de órdenes
- Ve a `/admin/orders`
- Debería mostrar órdenes con nombre y cédula del usuario
- NO debería mostrar "No disponible"

### 3. Prueba aprobar/rechazar una orden
- Haz clic en el botón "Aprobar" o "Rechazar"
- La orden se quita de "Pendientes"
- Ve a la sección "Aprobadas" o "Rechazadas"
- La orden debe estar allí
- El stock debe haberse actualizado

## 🔑 Variables de Entorno Requeridas

Asegúrate de tener en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # CRÍTICO para admin
```

⚠️ **IMPORTANTE**: El `SUPABASE_SERVICE_ROLE_KEY` es sensible. NO lo comitas a git.

## 📝 Cambios en Arquitectura

### Antes (no funcionaba):
```
Admin Panel → /api/admin/orders → supabase (anon key) 
                                  ↓
                          RLS bloqueaba acceso a usuarios
                          ↓
                          "No disponible"
```

### Ahora (funciona):
```
Admin Panel → /api/admin/orders → supabaseAdmin (service role key)
                                  ↓
                          Bypasea RLS, acceso completo
                          ↓
                          Muestra nombre, cédula, etc.
```

## 🐛 Si Sigue Sin Funcionar

Verifica en el navegador:
1. **Network tab** → Ve si la respuesta tiene error
2. **Console** → Busca mensajes de error
3. **Supabase Logs** → Revisa si hay rechazos por RLS

Posible causa: Las variables de entorno no se actualizaron en el servidor.
**Solución**: 
```bash
# En terminal
npm run dev
# Y espera a que recompile
```

## 📊 Flujo de Órdenes Correcto

1. Usuario crea orden (stock se congela en `reserved_stock`)
2. Admin ve orden en panel
3. Admin hace clic en "Aprobar"
4. Stock se decrementa (`reserved_stock` y `stock` bajan)
5. Orden pasa a "Aprobadas"
6. Si Admin rechaza: Solo baja `reserved_stock` (libera stock congelado)

## ✅ Checklist de Verificación

- [ ] Schema SQL ejecutado en Supabase
- [ ] `.env.local` tiene `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Server reiniciado (`npm run dev`)
- [ ] Login como admin funciona
- [ ] Órdenes muestran nombre y cédula
- [ ] Aprobar/Rechazar actualiza BD
- [ ] Órdenes aparecen en sección correspondiente

¡Listo! 🚀
