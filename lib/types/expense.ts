import { ExpenseCategory, ExpenseStatus } from './common';
import { User } from './user';

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
  type: ExpenseCategory; // Campo oficial
  // category (deprecated) ya no se usa; se mantiene en migraciones anteriores
  date: string;
  imageUrl?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  status?: ExpenseStatus;
  tripId?: string;
  driverId?: string; // ID del chofer que creó el gasto
  companyId?: string; // ID de la compañía
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  deleteReason?: string;
  deletedAt?: string;
  deletedBy?: string;
  isActive?: boolean;
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

// Nuevo contrato: el backend espera 'type' (enum) y además driverId & companyId.
// Mantenemos 'category' para compatibilidad temporal en la UI, pero no se envía.
export interface CreateExpenseData {
  description: string;
  amount: number;
  type: ExpenseCategory;
  date: string; // ISO string
  tripId: string;
  driverId: string;
  companyId: string;
  receiptUrl?: string;
}

export interface ExpenseFilters {
  type?: ExpenseCategory;
  tripId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
