import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import api from "@/lib/api";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  Trip,
  CreateTripData,
  UpdateTripData,
  TripFilters,
  TripsResponse,
  TripsWithExpensesResponse,
  ApiError,
} from "@/lib/types/index";

// Keys para React Query
export const tripKeys = {
  all: ["trips"] as const,
  lists: () => [...tripKeys.all, "list"] as const,
  list: (filters: TripFilters) => [...tripKeys.lists(), filters] as const,
  details: () => [...tripKeys.all, "detail"] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
  withExpenses: (id: string) => [...tripKeys.detail(id), "expenses"] as const,
};

// Hook para obtener lista de viajes con filtros y paginación
export const useTrips = (filters: TripFilters = {}) => {
  return useQuery({
    queryKey: tripKeys.list(filters),
    queryFn: async (): Promise<TripsResponse> => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `/trips?${params.toString()}`;

      const response = await api.get(url);

      return response.data;
    },
  });
};

// Hook para obtener viajes con gastos incluidos
export const useTripsWithExpenses = (filters: TripFilters = {}) => {
  return useQuery({
    queryKey: [...tripKeys.list(filters), "with-expenses"],
    queryFn: async (): Promise<TripsWithExpensesResponse> => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `/trips/with-expenses?${params.toString()}`;

      const response = await api.get(url);

      return response.data;
    },
  });
};

// Hook para obtener un viaje específico
export const useTrip = (id: string) => {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: async (): Promise<Trip> => {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para obtener un viaje con sus gastos
export const useTripWithExpenses = (id: string) => {
  return useQuery({
    queryKey: tripKeys.withExpenses(id),
    queryFn: async (): Promise<Trip> => {
      const response = await api.get(`/trips/${id}/with-expenses`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para crear un viaje
export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { handleError, is403Error } = useErrorHandler({
    show403Toast: true,
    customMessages: {
      403: "No tienes permisos para crear viajes. Contacta al administrador.",
    },
  });

  return useMutation({
    mutationFn: async (data: CreateTripData): Promise<Trip> => {
      const response = await api.post("/trips", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      toast.success("Viaje creado exitosamente");
      router.push(`/trips/${data.id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      // Si es error 403, usar el manejador personalizado
      if (is403Error(error)) {
        handleError(error);
      } else {
        // Para otros errores, usar el mensaje del servidor o uno genérico
        const message =
          error.response?.data?.message || "Error al crear el viaje";
        toast.error(message);
      }
    },
  });
};

// Hook para actualizar un viaje
export const useUpdateTrip = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTripData): Promise<Trip> => {
      const response = await api.patch(`/trips/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tripKeys.withExpenses(id) });
      toast.success("Viaje actualizado exitosamente");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al actualizar el viaje";
      toast.error(message);
    },
  });
};

// Hook para eliminar un viaje
export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/trips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      router.push("/trips");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al eliminar el viaje";
      toast.error(message);
    },
  });
};

// Hook para acciones de estado de viaje
export const useTripStatusActions = (tripId: string) => {
  const queryClient = useQueryClient();

  const startTrip = useMutation({
    mutationFn: async (): Promise<Trip> => {
      const response = await api.post(`/trips/${tripId}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
      queryClient.invalidateQueries({
        queryKey: tripKeys.withExpenses(tripId),
      });
      toast.success("Viaje iniciado exitosamente");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al iniciar el viaje";
      toast.error(message);
    },
  });

  const completeTrip = useMutation({
    mutationFn: async (): Promise<Trip> => {
      const response = await api.post(`/trips/${tripId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
      queryClient.invalidateQueries({
        queryKey: tripKeys.withExpenses(tripId),
      });
      toast.success("Viaje completado exitosamente");
    },
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message || "Error al completar el viaje";
      toast.error(message);
    },
  });

  return {
    startTrip,
    completeTrip,
    isStarting: startTrip.isPending,
    isCompleting: completeTrip.isPending,
  };
};
