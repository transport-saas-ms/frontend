# Transport SaaS - Frontend Dashboard

Dashboard frontend para plataforma de gestión de transporte construido con Next.js, TypeScript y TailwindCSS.

## 🚀 Características

- **Framework:** Next.js 15 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS v4 con diseño mobile-first
- **Gestión de estado:** Zustand para autenticación
- **Estado del servidor:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **Formularios:** React Hook Form con validación
- **Notificaciones:** React Hot Toast
- **Internacionalización:** Formateo de moneda en español (350.000,00)
- **Sistema de permisos:** Control granular basado en roles y capacidades

## 📁 Estructura del Proyecto

```
app/
├── (auth)/                 # Grupo de rutas de autenticación
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── layout.tsx         # Layout para autenticación
├── (dashboard)/           # Grupo de rutas del dashboard
│   ├── dashboard/         # Página principal del dashboard
│   ├── trips/            # Gestión de viajes
│   ├── expenses/         # Gestión de gastos
│   └── layout.tsx        # Layout del dashboard
├── providers.tsx         # Proveedores de React Query y Toast
└── layout.tsx           # Layout principal

components/
├── auth/                 # Componentes de autenticación
├── trips/               # Componentes de viajes
├── expenses/           # Componentes de gastos
├── users/              # Componentes de usuarios
├── ui/                 # Componentes UI reutilizables
├── dev/                # Componentes de desarrollo y debug
├── DashboardLayout.tsx # Layout principal del dashboard
├── DashboardStats.tsx  # Estadísticas del dashboard
├── AuthWrapper.tsx     # Wrapper de autenticación
├── PermissionGuard.tsx # Protección basada en permisos
└── PageWithPermissions.tsx # Páginas con validación de permisos

hooks/
├── useAuth.ts          # Hooks de autenticación
├── useAuthMe.ts        # Hook para datos del usuario actual
├── useTrips.ts         # Hooks de viajes
├── useExpenses.ts      # Hooks de gastos
├── useUsers.ts         # Hooks de usuarios
├── useCompany.ts       # Hook de información de empresa
├── useErrorHandler.ts  # Hook para manejo de errores
├── useTokenValidation.ts # Hook para validación de tokens
└── useDeleteConfirmation.ts # Hook para confirmación de eliminación

lib/
├── api.ts              # Configuración de Axios
├── permissions.ts      # Sistema de permisos y capacidades
├── utils.ts            # Utilidades generales (formateo de moneda, etc.)
├── cookies.ts          # Manejo de cookies
├── expenseUtils.ts     # Utilidades específicas de gastos
└── types/             # Tipos TypeScript organizados
    ├── auth.ts        # Tipos de autenticación
    ├── user.ts        # Tipos de usuarios
    ├── trip.ts        # Tipos de viajes
    ├── expense.ts     # Tipos de gastos
    ├── api.ts         # Tipos de API
    ├── common.ts      # Tipos comunes
    └── index.ts       # Exportaciones centralizadas

store/
└── auth.ts             # Store de Zustand para autenticación

middleware.ts           # Middleware para protección de rutas
```

## 🛠 Instalación y Configuración

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd frontend-saas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
```

Editar `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🔐 Autenticación y Autorización

### Roles de Usuario
- **ADMIN:** Acceso completo al sistema, gestión de usuarios y configuración
- **ACCOUNTANT:** Gestión de gastos, reportes financieros y validación de documentos
- **DRIVER:** Registro y edición de sus propios gastos, visualización de viajes asignados
- **USER:** Acceso limitado de solo lectura a información básica

### Sistema de Capacidades Granulares
El sistema implementa un control de acceso basado en capacidades específicas:

**Gestión de Gastos:**
- `MANAGE_EXPENSES`: Gestión completa de gastos (ADMIN, ACCOUNTANT)
- `UPDATE_OWN_EXPENSES`: Edición de gastos propios (DRIVER)
- `VIEW_EXPENSES`: Visualización de gastos (todos los roles)

**Gestión de Viajes:**
- `MANAGE_TRIPS`: Gestión completa de viajes (ADMIN, ACCOUNTANT)
- `VIEW_TRIPS`: Visualización de viajes (todos los roles)

**Gestión de Usuarios:**
- `MANAGE_USERS`: Gestión completa de usuarios (ADMIN)
- `VIEW_USERS`: Visualización de usuarios (ADMIN, ACCOUNTANT)

### Protección de Rutas
- Middleware automático para redirección según estado de autenticación
- Rutas protegidas: `/dashboard`, `/trips`, `/expenses`, `/users`
- Rutas públicas: `/login`, `/register`
- Validación de permisos a nivel de componente con `PermissionGuard`
- Páginas protegidas con `PageWithPermissions` para control granular

## 🚗 Módulos Principales

### Dashboard
- Resumen de estadísticas generales
- Viajes recientes
- Total de gastos
- Estados de viajes

### Gestión de Viajes
- Lista de viajes con filtros y paginación
- Creación y edición de viajes
- Detalle de viaje con gastos asociados
- Estados: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

### Gestión de Gastos
- Lista de gastos con filtros avanzados y paginación
- Registro de nuevos gastos con validación
- **Edición de gastos propios para drivers** - Los conductores pueden modificar sus propios gastos
- Categorías: FUEL, MAINTENANCE, TOLLS, FOOD, ACCOMMODATION, OTHER
- Asociación a viajes específicos
- **Formateo de moneda en español** (350.000,00 €)
- Validación de permisos granular según rol de usuario

### Gestión de Usuarios
- Lista de usuarios con roles y permisos
- Creación y edición de usuarios (solo ADMIN)
- Asignación de roles y capacidades
- Visualización de información detallada de usuarios

## 🔧 API Endpoints Utilizados

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener datos del usuario actual

### Viajes
- `GET /trips` - Lista de viajes (con filtros y paginación)
- `GET /trips/{id}` - Detalle de viaje
- `GET /trips/{id}/with-expenses` - Viaje con gastos
- `POST /trips` - Crear viaje
- `PATCH /trips/{id}` - Actualizar viaje
- `DELETE /trips/{id}` - Eliminar viaje

### Gastos
- `GET /expenses` - Lista de gastos (con filtros y paginación)
- `GET /expenses/{id}` - Detalle de gasto
- `POST /expenses` - Crear gasto
- `PATCH /expenses/{id}` - Actualizar gasto
- `DELETE /expenses/{id}` - Eliminar gasto

### Usuarios
- `GET /users` - Lista de usuarios (con paginación)
- `GET /users/{id}` - Detalle de usuario
- `POST /users` - Crear usuario
- `PATCH /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

### Empresa
- `GET /company` - Información de la empresa

## 🎨 Componentes UI

### Componentes Base
- **Button:** Botón reutilizable con variantes y espaciado optimizado
- **Input:** Campo de entrada con validación y estados de error
- **Select:** Selector con opciones y validación
- **LoadingSpinner:** Indicador de carga consistente
- **Modal:** Modal reutilizable con confirmaciones
- **ValidationErrors:** Componente para mostrar errores de validación
- **DeleteConfirmationModal:** Modal específico para confirmación de eliminación

### Layouts
- **DashboardLayout:** Layout principal con navegación responsive
- **AuthLayout:** Layout para páginas de autenticación

### Componentes Especializados
- **PermissionGuard:** Protección de componentes basada en permisos
- **PageWithPermissions:** Páginas con validación automática de acceso
- **AuthWrapper:** Wrapper para inicialización de autenticación
- **NoPermissionsView:** Vista para usuarios sin permisos suficientes

## 📱 Características de UX/UI

- **Diseño Mobile-First:** Completamente responsive con prioridad móvil
- **Dashboard Adaptativo:** Layout 1x4 en móvil, 2x2 en desktop
- **Espaciado Consistente:** Sistema de gaps optimizado para todos los tamaños
- **Formateo Localizado:** Monedas en formato español (350.000,00 €)
- **Loading States:** Indicadores de carga en todas las operaciones
- **Error Handling:** Manejo robusto de errores con notificaciones
- **Toast Notifications:** Feedback inmediato para acciones del usuario
- **Navegación Intuitiva:** Breadcrumbs y menús claros
- **Filtros y Búsqueda:** Filtrado avanzado en listas
- **Paginación:** Manejo eficiente de grandes datasets
- **Confirmaciones:** Modales de confirmación para acciones destructivas
- **Permisos Visuales:** UI adaptada según permisos del usuario

## 🚀 Scripts Disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Ejecutar linter
npm run type-check   # Verificar tipos TypeScript
```

## 🔄 Estado de la Aplicación

### React Query (TanStack Query)
- Cache automático de datos de API
- Revalidación en background
- Manejo de estados de carga y error
- Invalidación inteligente de queries

### Zustand Store
- Gestión del estado de autenticación
- Persistencia en localStorage
- Token JWT y datos de usuario

## 🛡 Seguridad

- **JWT Tokens:** Autenticación basada en tokens con refresh automático
- **Interceptores Axios:** Inyección automática de tokens y manejo de errores
- **Middleware de Rutas:** Protección a nivel de Next.js con redirección automática
- **Sistema de Permisos Granular:** Control de acceso basado en capacidades específicas
- **Validación de Formularios:** React Hook Form con validaciones client-side y server-side
- **Manejo de Errores:** Interceptación y manejo centralizado de errores de API
- **Protección CSRF:** Configuración adecuada para producción
- **Validación de Tokens:** Verificación automática de expiración y validez

## 📦 Dependencias Principales

```json
{
  "@tanstack/react-query": "^5.84.1",
  "axios": "^1.11.0",
  "next": "15.4.5",
  "react": "19.1.0",
  "react-hook-form": "^7.62.0",
  "react-hot-toast": "^2.5.2",
  "zustand": "^5.0.7",
  "tailwindcss": "^4"
}
```

## 🚦 Estados de Desarrollo

- ✅ Configuración base del proyecto
- ✅ Sistema de autenticación completo
- ✅ Gestión de viajes con CRUD completo
- ✅ Gestión de gastos con permisos granulares
- ✅ **Sistema de permisos para drivers** (edición de gastos propios)
- ✅ Dashboard con estadísticas responsive
- ✅ **Formateo de moneda en español**
- ✅ **Diseño mobile-first completo**
- ✅ Protección de rutas con middleware
- ✅ Componentes UI base optimizados
- ✅ Gestión de usuarios (ADMIN)
- ✅ Sistema de confirmaciones para eliminación
- ✅ Manejo robusto de errores
- ✅ **Espaciado consistente con sistema de gaps**
- 🔄 Formularios avanzados de creación/edición
- 🔄 Gestión de vehículos
- 🔄 Reportes y exportación
- 🔄 Tests unitarios e integración
- 🔄 Optimización de performance

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
