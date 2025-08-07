import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AuthMeResponse } from '@/lib/types';

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
      // No reintentar si es error de autenticación
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { data } = useAuthMe();
  
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

  return {
    permissions: data?.permissions,
    hasCapability,
    hasAnyCapability,
    hasAllCapabilities,
    isRole,
    isAdmin: isRole('ADMIN'),
    isAccountant: isRole('ACCOUNTANT'),
    isDriver: isRole('DRIVER'),
  };
};
