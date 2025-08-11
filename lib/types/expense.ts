import { ExpenseCategory, ExpenseStatus } from './common';
import { User } from './auth';

export interface ExpenseByCurrency {
  currency: string;
  total: number;
  count: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number | string; // Puede venir como string desde el backend
  currency?: string;
  type?: string; // Nuevo campo del backend
  category?: ExpenseCategory; // Para compatibilidad
  date: string;
  imageUrl?: string;
  receiptNumber?: string;
  receiptUrl?: string; // Para compatibilidad con versión anterior
  status?: ExpenseStatus;
  tripId?: string;
  trip?: {
    id: string;
    title: string;
    status: string;
    driverId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  };
  userId?: string;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  tripId: string;
  receiptUrl?: string;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  tripId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
