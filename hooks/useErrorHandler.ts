import { useCallback } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface UseErrorHandlerOptions {
  show403Toast?: boolean;
  redirectOn403?: boolean;
  customMessages?: {
    400?: string;
    401?: string;
    403?: string;
    404?: string;
    500?: string;
  };
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    show403Toast = true,
    redirectOn403 = false,
    customMessages = {},
  } = options;

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 400:
          // Manejar errores de validación (400)
          if (Array.isArray(message)) {
            // Si el mensaje es un array (errores de validación), mostrar el primer error
            toast.error(message[0] || customMessages[400] || 'Error de validación.');
          } else {
            toast.error(message || customMessages[400] || 'Datos inválidos.');
          }
          break;
        case 401:
          toast.error(customMessages[401] || 'Sesión expirada. Por favor inicia sesión nuevamente.');
          break;
        case 403:
          if (show403Toast) {
            toast.error(
              customMessages[403] || 
              'No tienes permisos para realizar esta acción. Espera a ser agregado a una compañía.'
            );
          }
          if (redirectOn403) {
            // La redirección será manejada por el DashboardLayout
          }
          break;
        case 404:
          toast.error(customMessages[404] || 'Recurso no encontrado.');
          break;
        case 500:
          toast.error(customMessages[500] || 'Error interno del servidor. Intenta más tarde.');
          break;
        default:
          toast.error(message || 'Ha ocurrido un error inesperado.');
      }
    } else {
      toast.error('Ha ocurrido un error inesperado.');
    }
  }, [customMessages, show403Toast, redirectOn403]);

  const is403Error = useCallback((error: unknown): boolean => {
    return error instanceof AxiosError && error.response?.status === 403;
  }, []);

  const is401Error = useCallback((error: unknown): boolean => {
    return error instanceof AxiosError && error.response?.status === 401;
  }, []);

  const is400Error = useCallback((error: unknown): boolean => {
    return error instanceof AxiosError && error.response?.status === 400;
  }, []);

  // Función específica para extraer mensajes de validación
  const getValidationErrors = useCallback((error: unknown): string[] => {
    if (error instanceof AxiosError && error.response?.status === 400) {
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        return message;
      } else if (typeof message === 'string') {
        return [message];
      }
    }
    return [];
  }, []);

  // Función para verificar si es un error específico de contraseña débil
  const isWeakPasswordError = useCallback((error: unknown): boolean => {
    const errors = getValidationErrors(error);
    return errors.some(err => 
      err.toLowerCase().includes('password') && 
      (err.toLowerCase().includes('longer') || err.toLowerCase().includes('characters'))
    );
  }, [getValidationErrors]);

  return {
    handleError,
    is403Error,
    is401Error,
    is400Error,
    getValidationErrors,
    isWeakPasswordError,
  };
};
