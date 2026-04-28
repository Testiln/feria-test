# Arquitectura - Plataforma de Solicitud y Gestión de Productos

## 1. Descripción de la Arquitectura

### Stack Tecnológico
- **Frontend:** Next.js 16.x (React 19) con TypeScript
- **Backend:** Next.js API Routes
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Almacenamiento:** Supabase Storage
- **Estilos:** Tailwind CSS 4

### Estructura de Capas

```
┌─────────────────────────────────────┐
│      Frontend (Next.js App)         │
│  ┌─────────────────────────────┐   │
│  │   User Portal Pages         │   │
│  │ - Registration              │   │
│  │ - Product Catalog           │   │
│  │ - Checkout                  │   │
│  ├─────────────────────────────┤   │
│  │   Admin Dashboard Pages     │   │
│  │ - Metrics                   │   │
│  │ - Order Management          │   │
│  │ - Inventory                 │   │
│  │ - Reports                   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         ↓ (API Calls)
┌─────────────────────────────────────┐
│    API Routes (Next.js Backend)     │
│  - /api/auth/*                      │
│  - /api/products/*                  │
│  - /api/orders/*                    │
│  - /api/admin/*                     │
│  - /api/uploads/*                   │
└─────────────────────────────────────┘
         ↓ (SQL Queries)
┌─────────────────────────────────────┐
│        Supabase (PostgreSQL)        │
│  ┌─────────────────────────────┐   │
│  │    Core Tables              │   │
│  │ - users                     │   │
│  │ - products                  │   │
│  │ - orders                    │   │
│  │ - order_items               │   │
│  │ - configuration             │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │    Auth System              │   │
│  │ - Built-in auth.users       │   │
│  │ - Sessions                  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         ↓ (File Uploads)
┌─────────────────────────────────────┐
│    Supabase Storage (S3-like)       │
│  - approval-documents/              │
│  - invoices/                        │
└─────────────────────────────────────┘
```

## 2. Flujos de Negocio

### 2.1 Flujo de Usuario - Solicitud de Productos

```
┌──────────────┐
│ 1. Registro  │ → Captura: nombre, cédula, cargo, email, teléfono
└──────┬───────┘   → Persistencia: Base de datos + localStorage
       │
       ↓
┌──────────────────────┐
│ 2. Ver Catálogo      │ → Lee productos de BD
└──────┬───────────────┘   → Muestra: nombre, imagen, stock disponible
       │
       ↓
┌──────────────────────┐
│ 3. Seleccionar Items │ → Controles +/- por producto
└──────┬───────────────┘   → Valida límite global (max_products_per_order)
       │
       ↓
┌──────────────────────┐
│ 4. Cargar Documento  │ → PDF o FOTO del "Formato de Aprobación"
└──────┬───────────────┘   → Validación de archivo
       │
       ↓
┌──────────────────────┐
│ 5. Verificar Stock   │ → Consulta BD en tiempo real
└──────┬───────────────┘   → Si stock insuficiente → Mostrar error
       │
       ↓ (Stock OK)
┌──────────────────────┐
│ 6. Congelar Stock    │ → Incrementa reserved_stock
└──────┬───────────────┘   → Crea orden con status='pending'
       │
       ↓
┌──────────────────────┐
│ 7. Notificar Admin   │ → Nueva entrada en la bandeja
└──────────────────────┘
```

### 2.2 Flujo Administrador - Aprobación de Órdenes

```
┌──────────────────────┐
│ 1. Ver Métricas      │ → Dashboard con KPIs en tiempo real
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ 2. Bandeja de Órdenes│ → Filtrar por status='pending'
└──────┬───────────────┘   → Muestra: usuario, productos, documento
       │
       ↓
┌──────────────────────┐
│ 3. Revisar Orden     │ → Ver detalles + previsualizar documento
└──────┬───────────────┘
       │
       ├─ ACEPTAR ──────────────────┐
       │                           │
       ↓                           ↓
┌──────────────────────┐  ┌────────────────────┐
│ 4a. Descongelar      │  │ 4b. Rechazar       │
│ - Resta del stock    │  │ - Liberar stock    │
│ - status='approved'  │  │ - status='rejected'│
│ - Generar PDF        │  │ - Notificar usuario│
│ - Guardar en Storage │  └────────────────────┘
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ 5. Historial         │ → Registra todas las órdenes procesadas
└──────────────────────┘
```

## 3. Estructuras de Datos

### 3.1 Tabla: users
```typescript
{
  id: UUID,                    // Clave primaria (referencia auth.users)
  full_name: string,           // Nombre completo
  document_id: string,         // Cédula (único)
  position: string,            // Cargo
  email: string,               // Correo
  phone: string,               // Teléfono
  created_at: timestamp,       // Fecha de creación
  updated_at: timestamp        // Fecha de actualización
}
```

### 3.2 Tabla: products
```typescript
{
  id: UUID,                    // Clave primaria
  code: string,                // SKU/código interno (único)
  name: string,                // Nombre del producto
  ecommerce_url: string,       // URL e-commerce
  image_url: string,           // URL de imagen
  stock: number,               // Stock disponible
  reserved_stock: number,      // Stock congelado en órdenes pending
  created_at: timestamp,
  updated_at: timestamp
}
```

### 3.3 Tabla: orders
```typescript
{
  id: UUID,                    // Clave primaria
  user_id: UUID,               // FK a users
  status: enum,                // 'pending' | 'approved' | 'rejected' | 'delivered'
  approval_document_url: string, // Ubicación en Storage
  invoice_url: string,         // PDF generado (si aprobado)
  total_items: number,         // Cantidad total de ítems
  notes: string,               // Notas del administrador
  created_at: timestamp,
  updated_at: timestamp,
  approved_at: timestamp,      // Cuando fue aprobada
  rejected_at: timestamp       // Cuando fue rechazada
}
```

### 3.4 Tabla: order_items
```typescript
{
  id: UUID,                    // Clave primaria
  order_id: UUID,              // FK a orders
  product_id: UUID,            // FK a products
  quantity: number,            // Cantidad solicitada
  created_at: timestamp
}
```

## 4. Módulos y Componentes

### 4.1 Frontend - Estructura de Páginas

```
src/app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Layout raíz
├── (public)/                   # Rutas públicas
│   ├── register/
│   │   └── page.tsx           # Formulario de registro
│   ├── products/
│   │   └── page.tsx           # Catálogo público
│   └── checkout/
│       └── page.tsx           # Carrito y checkout
├── (auth)/                     # Rutas autenticadas (usuario)
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard de usuario
│   └── orders/
│       └── [id]/page.tsx      # Detalle de orden
└── admin/                      # Rutas admin
    ├── layout.tsx             # Layout admin
    ├── page.tsx               # Dashboard principal
    ├── orders/
    │   ├── page.tsx           # Bandeja de órdenes
    │   └── [id]/page.tsx      # Detalle de orden
    ├── inventory/
    │   └── page.tsx           # Gestión de productos
    ├── reports/
    │   └── page.tsx           # Reportes y exportación
    └── config/
        └── page.tsx           # Configuración
```

### 4.2 API Routes

```
src/app/api/
├── auth/
│   ├── register/route.ts      # POST: Crear usuario
│   └── logout/route.ts        # POST: Cerrar sesión
├── products/
│   ├── route.ts               # GET: Listar productos
│   └── [id]/route.ts          # GET/PUT/DELETE: CRUD producto
├── orders/
│   ├── route.ts               # GET: Órdenes del usuario | POST: Crear orden
│   ├── [id]/route.ts          # GET: Detalle orden
│   └── [id]/approve/route.ts  # POST: Aprobar orden (admin)
├── admin/
│   ├── orders/
│   │   ├── route.ts           # GET: Todas las órdenes (admin)
│   │   └── [id]/reject/route.ts  # POST: Rechazar orden
│   ├── stats/route.ts         # GET: Métricas del dashboard
│   ├── config/route.ts        # GET/PUT: Configuración
│   └── reports/route.ts       # GET: Generar reporte CSV
└── uploads/
    └── route.ts               # POST: Subir archivo a Storage
```

## 5. Flujo de Manejo de Stock

### Estado del Stock

Cada producto tiene dos atributos:
- **stock**: Cantidad física disponible
- **reserved_stock**: Cantidad congelada en órdenes pending

**Stock realmente disponible = stock - reserved_stock**

### Transiciones de Estado

```
USUARIO SOLICITA
    ↓
    ├─ Verifica: ¿(stock - reserved_stock) >= cantidad?
    │
    ├─ SÍ → reserved_stock += cantidad
    │       Orden → status='pending'
    │
    └─ NO → Mostrar error "Stock insuficiente"


ADMIN APRUEBA ORDEN
    ↓
    ├─ stock -= cantidad
    │  reserved_stock -= cantidad
    │  Orden → status='approved'
    │  Generar PDF factura
    │  Subir a Storage


ADMIN RECHAZA ORDEN
    ↓
    ├─ reserved_stock -= cantidad
    │  Orden → status='rejected'
    │  Stock queda igual (nunca se decrementó)
```

## 6. Consideraciones de Seguridad

### Row Level Security (RLS)
- ✅ Usuarios solo ven sus propias órdenes
- ✅ Usuarios solo pueden modificar sus propios datos
- ✅ Productos visibles públicamente
- ✅ Configuración solo lectura para usuarios normales

### Roles y Permisos
```typescript
// En futuro: Usar custom claims en JWT para identificar admin
// Por ahora: Validar en API mediante service_role_key

User Role:
  - Ver catálogo de productos
  - Crear órdenes
  - Ver sus propias órdenes

Admin Role:
  - Ver todos los datos
  - Aprobar/rechazar órdenes
  - Gestionar productos
  - Ver reportes
  - Cambiar configuración
```

## 7. Próximos Pasos

1. ✅ Crear schema.sql en Supabase
2. Implementar componentes de UI (Portal)
3. Implementar API routes
4. Implementar Dashboard Admin
5. Integrar generación de PDFs
6. Testing y validaciones
7. Deployment
