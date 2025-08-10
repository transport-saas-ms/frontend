import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { User } from '@/lib/types';

// Hook para obtener usuarios de una empresa
export const useCompanyUsers = (companyId: string) => {
  return useQuery({
    queryKey: ['company-users', companyId],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get(`/companies/${companyId}/users`);
      
      // La respuesta tiene el formato: { company, count, users }
      if (response.data && Array.isArray(response.data.users)) {
        return response.data.users;
      }
      
      // Fallback: si no tiene la estructura esperada, devolver array vacío
      console.warn('Expected users array in response.data.users, got:', response.data);
      return [];
    },
    enabled: !!companyId,
  });
};
