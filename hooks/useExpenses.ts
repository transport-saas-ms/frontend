import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { 
  Expense, 
  CreateExpenseData, 
  ExpenseFilters, 
  ExpensesResponse, 
  ApiError 
} from '@/lib/types/index';

// Keys para React Query
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// Hook para obtener lista de gastos con filtros y paginación
export const useExpenses = (filters: ExpenseFilters = {}) => {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: async (): Promise<ExpensesResponse> => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `/expenses?${params.toString()}`;
      
      const response = await api.get(url);
      
      return response.data;
    },
  });
};

// Hook para obtener un gasto específico
export const useExpense = (id: string) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: async (): Promise<Expense> => {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para crear un gasto
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData): Promise<Expense> => {
      const response = await api.post('/expenses', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // También invalidar los datos del viaje relacionado
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', data.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', data.tripId, 'expenses'] });
      toast.success('Gasto registrado exitosamente');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al registrar el gasto';
      toast.error(message);
    },
  });
};

// Hook para actualizar un gasto
export const useUpdateExpense = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateExpenseData>): Promise<Expense> => {
      const response = await api.patch(`/expenses/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      // También invalidar los datos del viaje relacionado
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', data.tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips', 'detail', data.tripId, 'expenses'] });
      toast.success('Gasto actualizado exitosamente');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al actualizar el gasto';
      toast.error(message);
    },
  });
};

// Hook para eliminar un gasto
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      toast.success('Gasto eliminado exitosamente');
    },
    onError: (error: AxiosError<ApiError>) => {
      const message = error.response?.data?.message || 'Error al eliminar el gasto';
      toast.error(message);
    },
  });
};
