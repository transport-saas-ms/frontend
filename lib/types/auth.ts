import { UserRole } from './common';
import { User, UserPermissions } from './user';

// Re-exportar User para compatibilidad
export type { User, UserPermissions } from './user';

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
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: UserRole;
  expiresIn: number;
}
