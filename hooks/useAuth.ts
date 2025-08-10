import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoginCredentials, RegisterData, AuthResponse, ApiError } from '@/lib/types';
import { authKeys } from './useAuthMe';

// Hook para login
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, setUserProfile } = useAuthStore();
  const { handleError, is400Error } = useErrorHandler({
    customMessages: {
      400: 'Los datos de inicio de sesión no son válidos.',
    },
  });

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      // 1. Guardar tokens inmediatamente
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.userId,
        role: data.role
      });

      try {
        // 2. Obtener perfil completo del usuario
        const profileResponse = await api.get('/auth/me');
        const { user, permissions } = profileResponse.data;
        
        // 3. Guardar perfil completo
        setUserProfile(user, permissions);
        
        // 4. Invalidar query de auth/me para mantener sincronizado
        queryClient.setQueryData(authKeys.me, { user, permissions });
        
        toast.success(`¡Bienvenido, ${user.name}!`);
        router.push('/dashboard');
      } catch (error) {
        console.error('Error al obtener perfil:', error);
        toast.success('Sesión iniciada correctamente');
        router.push('/dashboard');
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      // Si es un error de validación (400), usar el manejador específico
      if (is400Error(error)) {
        handleError(error);
      } else {
        // Para otros errores, usar el mensaje del servidor o uno genérico
        const message = error.response?.data?.message || 'Error al iniciar sesión';
        toast.error(message);
      }
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const router = useRouter();
  const { handleError, is400Error, getValidationErrors, isWeakPasswordError } = useErrorHandler({
    customMessages: {
      400: 'Los datos proporcionados no son válidos.',
    },
  });

  return useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cuenta creada exitosamente. Por favor inicia sesión.');
      router.push('/login');
    },
    onError: (error: AxiosError<ApiError>) => {
      // Si es un error de validación (400), usar el manejador específico
      if (is400Error(error)) {
        // Si es específicamente un error de contraseña débil
        if (isWeakPasswordError(error)) {
          const validationErrors = getValidationErrors(error);
          const passwordError = validationErrors.find(err => 
            err.toLowerCase().includes('password')
          );
          toast.error(passwordError || 'La contraseña no cumple con los requisitos de seguridad.');
        } else {
          // Usar el manejador general para otros errores 400
          handleError(error);
        }
      } else {
        // Para otros errores, usar el mensaje del servidor o uno genérico
        const message = error.response?.data?.message || 'Error al crear la cuenta';
        toast.error(message);
      }
    },
  });
};

// Hook para logout
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      // Opcional: llamar al endpoint de logout del servidor
      // await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Limpiar todas las queries
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
    },
    onError: () => {
      // Aún así cerramos sesión localmente
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
};
