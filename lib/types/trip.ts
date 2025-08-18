import { TripStatus, BaseEntity } from './common';
import { User } from './auth';
import { Expense, ExpenseByCurrency } from './expense';

export interface Trip extends BaseEntity {
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
  status: TripStatus;
  driverId: string;
  companyId: string;
  createdBy: string;
  driver?: User;
  expenses?: Expense[];
  expensesByCurrency?: ExpenseByCurrency[];
  totalExpensesCount?: number;
  totalExpenses?: number;
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
  status?: TripStatus;
  driverId?: string;
  vehicleId?: string;
}

export interface TripFilters {
  status?: TripStatus;
  driverId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
