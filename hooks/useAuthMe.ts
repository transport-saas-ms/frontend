import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AuthMeResponse } from '@/lib/types/index';

// Key para React Query
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// Hook para obtener información del usuario autenticado
export const useAuthMe = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<AuthMeResponse> => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: unknown) => {
      // No reintentar si es error de autenticación o autorización
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { data, error } = useAuthMe();
  
  const hasCapability = (capability: string): boolean => {
    return data?.permissions?.capabilities?.includes(capability) || false;
  };

  const hasAnyCapability = (capabilities: string[]): boolean => {
    return capabilities.some(capability => hasCapability(capability));
  };

  const hasAllCapabilities = (capabilities: string[]): boolean => {
    return capabilities.every(capability => hasCapability(capability));
  };

  const isRole = (role: string): boolean => {
    return data?.permissions?.role === role;
  };

  // Verificar si es un usuario sin permisos (role USER y sin capabilities)
  const isUserWithoutPermissions = (): boolean => {
    // Si hay error 403, es probable que sea un usuario sin permisos
    if (error && typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response: { status: number } };
      if (axiosError.response?.status === 403) {
        return true;
      }
    }
    
    // También verificar por role y capabilities vacías
    const isUser = isRole('USER');
    const hasNoCapabilities = !data?.permissions?.capabilities || data.permissions.capabilities.length === 0;
    return isUser && hasNoCapabilities;
  };

  // Función helper para debug - verificar si debería tener acceso a algo
  const shouldHaveAccess = (requiredCapabilities: string[] = [], requiredRoles: string[] = []): boolean => {
    // Si es ADMIN, siempre debería tener acceso (a menos que esté explícitamente restringido)
    if (isRole('ADMIN')) {
      return true;
    }
    
    // Verificar roles
    if (requiredRoles.length > 0) {
      const hasRole = requiredRoles.some(role => isRole(role));
      if (hasRole) return true;
    }
    
    // Verificar capabilities
    if (requiredCapabilities.length > 0) {
      return hasAnyCapability(requiredCapabilities);
    }
    
    return false;
  };

  return {
    permissions: data?.permissions,
    hasCapability,
    hasAnyCapability,
    hasAllCapabilities,
    isRole,
    isUserWithoutPermissions,
    shouldHaveAccess,
    isAdmin: isRole('ADMIN'),
    isAccountant: isRole('ACCOUNTANT'),
    isDriver: isRole('DRIVER'),
    error,
  };
};
