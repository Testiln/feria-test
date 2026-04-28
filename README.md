# Dashboard Feria - Plataforma de Solicitud y Gestión de Productos

Una solución B2C de plataforma web para solicitud y gestión de productos, con portal de usuario y panel administrativo.

## 🚀 Quick Start

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Configurar Variables de Entorno

Copia los valores de tu proyecto Supabase en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MAX_PRODUCTS_PER_ORDER=10
```

### 2. Crear Base de Datos

En la consola de Supabase (SQL Editor):
1. Copia todo el contenido de `schema.sql`
2. Pega en el SQL Editor
3. Ejecuta para crear las tablas y políticas

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
dashboard-feria/
├── src/
│   ├── app/
│   │   ├── (public)/           # Rutas públicas: registro, catálogo
│   │   ├── (auth)/             # Rutas protegidas: usuario
│   │   ├── admin/              # Rutas admin: dashboard, órdenes
│   │   ├── api/                # API routes: backend
│   │   ├── layout.tsx          # Layout raíz
│   │   └── page.tsx            # Landing page
│   ├── components/             # Componentes reutilizables
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils/              # Funciones auxiliares
│   ├── styles/                 # Estilos globales
│   └── middleware.ts           # Middleware (autenticación)
├── public/                     # Assets estáticos
├── .env.local                  # Variables de entorno
├── schema.sql                  # Esquema de BD
├── ARCHITECTURE.md             # Documentación de arquitectura
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🏗️ Stack Tecnológico

| Layer | Tecnología |
|-------|-----------|
| **Frontend** | Next.js 16.x, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, PostCSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage (PDFs) |
| **Dev Tools** | ESLint, TypeScript |

## 📋 Características Principales

### Portal de Usuario
- ✅ Registro de usuario con captura de datos (cédula, cargo, contacto)
- ✅ Persistencia local en navegador
- ✅ Catálogo de productos con búsqueda
- ✅ Carrito con controles de cantidad
- ✅ Límite global de productos por orden
- ✅ Carga de documento de aprobación
- ✅ Validación de stock en tiempo real
- ✅ Confirmación de solicitud

### Dashboard Administrativo
- ✅ Métricas en tiempo real (solicitudes, aprobación %, rechazo %, vendidos, disponibles)
- ✅ Bandeja de órdenes pendientes
- ✅ Vista de detalle de orden con documento
- ✅ Botones Aceptar/Rechazar
- ✅ Generación automática de facturas PDF
- ✅ Historial de órdenes procesadas
- ✅ Exportación a CSV
- ✅ Gestión de productos (CRUD)
- ✅ Configuración de límites globales

## 🔄 Flujos de Negocio

### Flujo de Usuario
1. **Registro** → Captura datos (guardar en BD + localStorage)
2. **Catálogo** → Ver productos disponibles
3. **Seleccionar** → Ajustar cantidades con validación de límite
4. **Documento** → Cargar PDF/foto de aprobación
5. **Verificar** → Sistema valida stock en tiempo real
6. **Congelar** → Stock se reserva (pending)
7. **Notificar** → Admin recibe alerta

### Flujo Administrativo
1. **Dashboard** → Ver métricas actualizadas
2. **Bandeja** → Revisar órdenes pendientes
3. **Detalle** → Ver datos completos + documento
4. **Decisión** → Aprobar o rechazar

**Si Aprueba:**
- Descongelar + decrementar stock
- Generar PDF factura
- Subir a Storage
- Notificar usuario

**Si Rechaza:**
- Liberar stock congelado
- Marcar como rechazada
- Notificar usuario

## 📊 Gestión de Stock

Cada producto tiene dos atributos:
```
stock = cantidad física
reserved_stock = cantidad congelada en órdenes pending

Stock disponible para usuario = stock - reserved_stock
```

**Transiciones:**
- **Usuario solicita** → `reserved_stock += cantidad`
- **Admin aprueba** → `stock -= cantidad`, `reserved_stock -= cantidad`
- **Admin rechaza** → `reserved_stock -= cantidad` (stock no cambia)

## 🔐 Seguridad

- ✅ Row Level Security (RLS) en Supabase
- ✅ Usuarios solo ven sus propias órdenes
- ✅ Validación de autenticación en API routes
- ✅ Service role key para operaciones administrativas

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/[id]` - Obtener producto
- `POST /api/products` - Crear (admin)
- `PUT /api/products/[id]` - Actualizar (admin)
- `DELETE /api/products/[id]` - Eliminar (admin)

### Órdenes
- `GET /api/orders` - Órdenes del usuario
- `POST /api/orders` - Crear orden
- `GET /api/orders/[id]` - Detalle de orden
- `POST /api/orders/[id]/approve` - Aprobar (admin)
- `POST /api/orders/[id]/reject` - Rechazar (admin)

### Admin
- `GET /api/admin/orders` - Todas las órdenes
- `GET /api/admin/stats` - Métricas
- `GET /api/admin/reports` - Exportar CSV
- `GET /api/admin/config` - Ver configuración
- `PUT /api/admin/config` - Actualizar configuración

## 🛠️ Tareas de Desarrollo

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para detalles completos de arquitectura y diseño.

### Próximos Pasos:
1. [ ] Crear esquema en Supabase
2. [ ] Implementar componentes UI (Portal)
3. [ ] Implementar API routes
4. [ ] Implementar Dashboard Admin
5. [ ] Integrar generación de PDFs
6. [ ] Testing
7. [ ] Deployment

## 💾 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor local

# Build
npm run build        # Build para producción
npm start            # Inicia servidor de producción

# Lint
npm run lint         # Ejecutar ESLint

# Base de datos
# Ver schema.sql para estructura completa
```

## 🌐 Deployment

### Supabase
1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `schema.sql` en SQL Editor
3. Configura políticas de seguridad (RLS)
4. Obtén credenciales y configúralas

### Next.js
Opciones recomendadas:
- **Vercel** (oficial de Next.js)
- **Railway**
- **Render**
- **Docker** (autohospedado)

## 📞 Soporte

Documentación técnica: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
Esquema SQL: [`schema.sql`](./schema.sql)
