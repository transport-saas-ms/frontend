# Transport SaaS - Frontend Dashboard

Dashboard frontend para plataforma de gestión de transporte construido con Next.js, TypeScript y TailwindCSS.

## 🚀 Características

- **Framework:** Next.js 15 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Gestión de estado:** Zustand para autenticación
- **Estado del servidor:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **Formularios:** React Hook Form
- **Notificaciones:** React Hot Toast

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
├── ui/                 # Componentes UI reutilizables
├── DashboardLayout.tsx # Layout principal del dashboard
└── DashboardStats.tsx  # Estadísticas del dashboard

hooks/
├── useAuth.ts          # Hooks de autenticación
├── useTrips.ts         # Hooks de viajes
└── useExpenses.ts      # Hooks de gastos

lib/
├── api.ts              # Configuración de Axios
└── types.ts            # Tipos TypeScript

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
- **ADMIN:** Acceso completo al sistema
- **ACCOUNTANT:** Gestión de gastos y reportes
- **DRIVER:** Registro de gastos y visualización de viajes asignados
- **USER:** Acceso limitado de solo lectura

### Protección de Rutas
- Middleware automático para redirección según estado de autenticación
- Rutas protegidas: `/dashboard`, `/trips`, `/expenses`
- Rutas públicas: `/login`, `/register`

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
- Lista de gastos con filtros
- Registro de nuevos gastos
- Categorías: FUEL, MAINTENANCE, TOLLS, FOOD, ACCOMMODATION, OTHER
- Asociación a viajes específicos

## 🔧 API Endpoints Utilizados

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión

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

## 🎨 Componentes UI

### Componentes Base
- **Button:** Botón reutilizable con variantes
- **Input:** Campo de entrada con validación
- **Select:** Selector con opciones
- **LoadingSpinner:** Indicador de carga
- **EmptyState:** Estado vacío con acciones

### Layouts
- **DashboardLayout:** Layout principal con navegación
- **AuthLayout:** Layout para páginas de autenticación

## 📱 Características de UX/UI

- **Responsive Design:** Adaptable a móviles y escritorio
- **Loading States:** Indicadores de carga en todas las operaciones
- **Error Handling:** Manejo de errores con notificaciones
- **Toast Notifications:** Feedback inmediato para acciones del usuario
- **Navegación Intuitiva:** Breadcrumbs y menús claros
- **Filtros y Búsqueda:** Filtrado avanzado en listas
- **Paginación:** Manejo eficiente de grandes datasets

## 🚀 Scripts Disponibles

```bash
npm run dev          # Ejecutar en desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Ejecutar linter
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

- **JWT Tokens:** Autenticación basada en tokens
- **Interceptores Axios:** Inyección automática de tokens
- **Middleware de Rutas:** Protección a nivel de Next.js
- **Validación de Formularios:** React Hook Form con validaciones
- **CORS:** Configuración adecuada para producción

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
- ✅ Sistema de autenticación
- ✅ Gestión de viajes
- ✅ Gestión de gastos
- ✅ Dashboard con estadísticas
- ✅ Protección de rutas
- ✅ Componentes UI base
- 🔄 Formularios de creación/edición
- 🔄 Gestión de vehículos
- 🔄 Reportes y exportación
- 🔄 Tests unitarios e integración

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
