import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    User,
    CreateUserData,
    UpdateUserData,
    ChangePasswordData,
    UsersResponse,
    UserFilters,
    ApiError,
} from "@/lib/types/index";
import { useErrorHandler } from "./useErrorHandler";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

const userKeys = {
  users: ["users"] as const,
  usersList: (filters?: UserFilters) => ["users", "list", filters] as const,
  user: (id: string) => ["users", id] as const,
};

export const useUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: userKeys.usersList(filters),
    queryFn: async (): Promise<UsersResponse> => {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...(filters.role && { role: filters.role }),
        ...(filters.search && { search: filters.search }),
      };
      
      console.log('Filters being sent to API:', params);
      
      const response = await api.get<UsersResponse>('/users', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.user(id),
    queryFn: async (): Promise<User> => {
      const response = await api.get(`/users/${id}`);
      return response.data.user; // Acceder al objeto user dentro de la respuesta
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleError, is403Error } = useErrorHandler({
    show403Toast: true,
    customMessages: {
      403: "No tienes permisos para crear usuarios.",
    },
  });

  return useMutation({
    mutationFn: async (data: CreateUserData): Promise<User> => {
      const response = await api.post("/users", data);
      return response.data.user; // Intentar ambas estructuras
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.users, // Invalida todas las queries de usuarios
      });
      toast.success("Usuario creado exitosamente");
      router.push(`/users/${data.id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      // Si es error 403, usar el manejador personalizado
      if (is403Error(error)) {
        handleError(error);
      } else {
        // Para otros errores, usar el mensaje del servidor o uno genérico
        const message =
          error.response?.data?.message || "Error al crear usuario";
        toast.error(message);
      }
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserData): Promise<User> => {
      const response = await api.patch(`/users/${id}`, data);
      return response.data.user || response.data; // Intentar ambas estructuras
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.users, // Invalida todas las queries de usuarios
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.user(id), // Invalida también el usuario específico
      });
      toast.success("Usuario actualizado exitosamente");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al editar usuario";
      toast.error(message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.users, // Invalida todas las queries de usuarios
      });
      router.push("/users");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al eliminar usuario";
      toast.error(message);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordData): Promise<void> => {
      await api.patch(`/users/${data.userId}/change-password`, {
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
      });
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada exitosamente");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al cambiar contraseña";
      toast.error(message);
    },
  });
};
