import { UserRole, Company } from './common';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  company: Company;
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
  role?: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: UserRole;
  expiresIn: number;
}
