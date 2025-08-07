'use client';

import React from 'react';
import { usePermissions } from '@/hooks/useAuthMe';

interface PermissionGuardProps {
  children: React.ReactNode;
  capabilities?: string[];
  requireAll?: boolean; // Si true, requiere TODOS los permisos. Si false, requiere AL MENOS UNO
  roles?: string[];
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  capabilities = [],
  requireAll = false,
  roles = [],
  fallback = null,
}) => {
  const { hasAnyCapability, hasAllCapabilities, isRole, permissions } = usePermissions();

  // Si no hay permisos cargados aún, no mostrar nada
  if (!permissions) {
    return <>{fallback}</>;
  }

  // Verificar roles si se especificaron
  if (roles.length > 0) {
    const hasRole = roles.some(role => isRole(role));
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  // Verificar capabilities si se especificaron
  if (capabilities.length > 0) {
    const hasPermission = requireAll 
      ? hasAllCapabilities(capabilities)
      : hasAnyCapability(capabilities);
    
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Hook para usar en lógica condicional
export const useCanAccess = (
  capabilities: string[] = [],
  requireAll: boolean = false,
  roles: string[] = []
): boolean => {
  const { hasAnyCapability, hasAllCapabilities, isRole, permissions } = usePermissions();

  if (!permissions) return false;

  // Verificar roles
  if (roles.length > 0) {
    const hasRole = roles.some(role => isRole(role));
    if (!hasRole) return false;
  }

  // Verificar capabilities
  if (capabilities.length > 0) {
    return requireAll 
      ? hasAllCapabilities(capabilities)
      : hasAnyCapability(capabilities);
  }

  return true;
};
