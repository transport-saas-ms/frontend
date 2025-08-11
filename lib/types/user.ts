import { BaseEntity, UserRole, Company } from './common';

// Interface principal del usuario (movida desde auth.ts)
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  company: Company;
  isActive: boolean; // Soft delete: false = eliminado, true = activo (el servidor filtra automáticamente los false)
  createdAt: string;
}

// Tipos específicos para gestión de usuarios
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId?: string; // Se asignará automáticamente del usuario creador
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  // isActive no se incluye aquí porque el soft delete se maneja desde la acción de eliminar
  // password será separado para cambio de contraseña
}

export interface ChangePasswordData {
  userId: string;
  newPassword: string;
  currentPassword?: string; // Para validación adicional
}

// Datos para soft delete (eliminación lógica)
export interface DeleteUserData {
  userId: string;
  // El servidor pondrá isActive = false automáticamente
}

// Respuesta del backend para listado de usuarios
export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filtros para búsqueda de usuarios
export interface UserFilters {
  role?: UserRole;
  search?: string; // búsqueda por nombre o email
  // isActive no se incluye porque el servidor automáticamente filtra usuarios inactivos (soft delete)
  page?: number;
  limit?: number;
}

// Tipos para permisos de usuario (movido desde auth.ts)
export interface UserPermissions {
  role: string;
  capabilities: string[];
  restrictions: string[];
}

// Respuesta completa con usuario y permisos
export interface UserWithPermissions {
  user: User;
  permissions: UserPermissions;
}
