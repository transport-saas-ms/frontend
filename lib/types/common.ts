// Enums y tipos base compartidos
export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'DRIVER' | 'USER';

export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type ExpenseCategory = 'FUEL' | 'TOLL' | 'FOOD' | 'REPAIR' | 'OTHER';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Interfaces base compartidas
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
}
