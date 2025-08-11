import { Trip } from './trip';
import { Expense } from './expense';

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

// Tipos para errores de API
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
