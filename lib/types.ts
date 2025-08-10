// Tipos para la autenticación
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'DRIVER' | 'USER';
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPermissions {
  role: string;
  capabilities: string[];
  restrictions: string[];
}

export interface AuthMeResponse {
  user: User;
  permissions: UserPermissions;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'ACCOUNTANT' | 'DRIVER' | 'USER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'DRIVER' | 'USER';
  expiresIn: number;
}

// Tipos para viajes
export interface Trip {
  id: string;
  title: string;
  description?: string;
  origin?: string;
  destination?: string;
  distance?: number;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  startDate?: string; // Para compatibilidad con la versión anterior
  endDate?: string;   // Para compatibilidad con la versión anterior
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverId: string;
  companyId: string;
  createdBy: string;
  driver?: User;
  vehicleId?: string;
  vehicle?: Vehicle;
  expenses?: Expense[];
  expensesByCurrency?: ExpenseByCurrency[];
  totalExpensesCount?: number;
  totalExpenses?: number;
  createdAt: string;
  updatedAt: string;
}

// Nuevo tipo para gastos por moneda
export interface ExpenseByCurrency {
  currency: string;
  total: number;
  count: number;
}

export interface CreateTripData {
  title: string;
  description?: string;
  origin: string;
  destination: string;
  scheduledDate: string;
  driverId: string;
  companyId: string;
}

export interface UpdateTripData {
  origin?: string;
  destination?: string;
  distance?: number;
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverId?: string;
  vehicleId?: string;
}

// Tipos para gastos
export interface Expense {
  id: string;
  description: string;
  amount: number | string; // Puede venir como string desde el backend
  currency?: string;
  type?: string; // Nuevo campo del backend
  category?: 'FUEL' | 'MAINTENANCE' | 'TOLLS' | 'FOOD' | 'ACCOMMODATION' | 'OTHER'; // Para compatibilidad
  date: string;
  imageUrl?: string;
  receiptNumber?: string;
  receiptUrl?: string; // Para compatibilidad con versión anterior
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  tripId?: string;
  trip?: Trip;
  userId?: string;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: 'FUEL' | 'MAINTENANCE' | 'TOLLS' | 'FOOD' | 'ACCOMMODATION' | 'OTHER';
  date: string;
  tripId: string;
  receiptUrl?: string;
}

// Tipos para vehículos
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  createdAt: string;
  updatedAt: string;
}

// Tipos para paginación
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipo específico para la respuesta del backend de viajes
export interface TripsResponse {
  trips: Trip[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipo específico para la respuesta del backend de viajes con gastos
export interface TripsWithExpensesResponse {
  trips: Trip[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Tipo específico para la respuesta del backend de gastos
export interface ExpensesResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
  status?: string;
}

// Tipos para filtros
export interface TripFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseFilters {
  category?: 'FUEL' | 'MAINTENANCE' | 'TOLLS' | 'FOOD' | 'ACCOMMODATION' | 'OTHER';
  tripId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Tipos para errores de API
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
