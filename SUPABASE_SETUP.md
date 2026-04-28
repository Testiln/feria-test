# Guía de Configuración - Supabase

## 1. Crear Proyecto en Supabase

1. Accede a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Selecciona región (recomendado: Virginia o Canadá)
4. Espera a que se inicialice (1-2 minutos)

## 2. Obtener Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** (público) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** (secreto) → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Importante:** Nunca compartas la `Service Role Key` públicamente.

3. Pega estos valores en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_MAX_PRODUCTS_PER_ORDER=10
```

## 3. Ejecutar Schema en Base de Datos

1. En la consola de Supabase, ve a **SQL Editor**
2. Crea una nueva consulta (New Query)
3. Abre el archivo [schema.sql](./schema.sql)
4. Copia **TODO** el contenido
5. Pega en el SQL Editor
6. Click en **Run**

**Resultado esperado:**
```
Query executed successfully
```

Si hay errores, verifica que:
- La extensión `uuid-ossp` está disponible
- Las tablas no existan previamente
- Tienes permisos de escritura

## 4. Verificar Tablas Creadas

1. Ve a **Table Editor**
2. Deberías ver:
   - `users`
   - `products`
   - `orders`
   - `order_items`
   - `configuration`

## 5. Configurar Row Level Security (RLS)

El schema.sql ya incluye políticas de RLS. Verifica en **Authentication** → **Policies**:

✅ Políticas para `users`:
- Usuarios pueden ver su propio perfil
- Usuarios pueden actualizar su propio perfil

✅ Políticas para `products`:
- Todos pueden ver productos

✅ Políticas para `orders`:
- Usuarios solo ven sus órdenes
- Usuarios solo pueden crear órdenes (con FK correcta)

✅ Políticas para `order_items`:
- Usuarios ven items de sus órdenes

✅ Políticas para `configuration`:
- Todos pueden leer configuración

## 6. Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (ya viene habilitado por defecto)
3. Ve a **Settings** → **Email Templates** (opcional: personalizar emails)

### Crear Usuario Admin (Opcional)

Para crear un usuario admin manualmente:

1. Ve a **Authentication** → **Users**
2. Click en **Add user**
3. Email: `admin@dashboard-feria.local`
4. Password: (generar contraseña fuerte)
5. Click en **Create user**

## 7. Configurar Storage para Archivos

1. Ve a **Storage** en el menú lateral
2. Click en **Create a new bucket**

### Bucket 1: approval-documents
- Nombre: `approval-documents`
- Privacidad: **Private** (solo usuarios autenticados)

**Políticas para este bucket:**
- Usuarios pueden subir documentos
- Usuarios pueden ver/descargar sus propios documentos
- Admins pueden ver todos

### Bucket 2: invoices
- Nombre: `invoices`
- Privacidad: **Private**

**Políticas para este bucket:**
- Admins pueden subir facturas
- Usuarios pueden descargar sus facturas

## 8. Cargar Datos de Prueba (Opcional)

Para probar, inserta productos:

```sql
INSERT INTO products (code, name, ecommerce_url, image_url, stock) VALUES
('SKU-001', 'Producto A', 'https://example.com/a', 'https://via.placeholder.com/300', 50),
('SKU-002', 'Producto B', 'https://example.com/b', 'https://via.placeholder.com/300', 30),
('SKU-003', 'Producto C', 'https://example.com/c', 'https://via.placeholder.com/300', 75);
```

## 9. Verificar Conexión desde Next.js

En tu proyecto Next.js:

```bash
npm run dev
```

El servidor debe iniciar sin errores de conexión. Si hay problemas:

1. Verifica que `.env.local` esté configurado correctamente
2. Asegúrate que las URLs no tengan espacios
3. Revisa la consola del navegador (F12) para errores de API

## 10. Configurar CORS (Si es necesario)

Si recibes errores CORS:

1. Ve a **Settings** → **API**
2. Desplázate a **CORS Configuration**
3. Añade tu dominio:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`

## 11. Monitorar y Debugging

### Ver Logs de Base de Datos
- **Database** → **Logs** (ver queries ejecutadas)

### Ver Autenticaciones
- **Authentication** → **Users** (ver usuarios registrados)

### Usar SQL Editor para Queries Manuales
Útil para verificar datos o hacer cambios directos:

```sql
-- Ver todas las órdenes
SELECT * FROM orders;

-- Ver órdenes de un usuario
SELECT * FROM orders WHERE user_id = 'user-uuid';

-- Actualizar stock de un producto
UPDATE products SET stock = 100 WHERE code = 'SKU-001';
```

## Troubleshooting

### Error: "permission denied"
- ✅ Verifica que RLS policies están correctas
- ✅ Asegúrate que el usuario está autenticado
- ✅ Revisa que tiene permisos en esa tabla

### Error: "relation 'tablename' does not exist"
- ✅ Ejecuta el schema.sql nuevamente
- ✅ Verifica que no haya errores en la ejecución

### Error: "Invalid API key"
- ✅ Revisa que las claves están bien copiadas en .env.local
- ✅ Asegúrate de usar ANON_KEY (no service role) en el cliente

### Error: CORS
- ✅ Añade tu dominio en CORS Configuration
- ✅ Verifica que la URL de Supabase es correcta

## Recursos Útiles

- [Documentación oficial Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Tutorial](https://supabase.com/docs/guides/database)
- [Client Libraries](https://supabase.com/docs/reference/javascript/introduction)

## Próximos Pasos

Una vez Supabase esté configurado:
1. ✅ Crear componentes de UI (Portal)
2. ✅ Implementar API routes
3. ✅ Conectar el frontend a la BD
4. ✅ Implementar autenticación en el frontend
