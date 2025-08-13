import axios from 'axios';

// Crear instancia de axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las solicitudes
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage en el cliente
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Verificar si es un error 401 pero NO es por token expirado
    const isPasswordError = error.response?.status === 401 && 
                           (error.response?.data?.error === 'InvalidCurrentPassword' ||
                            error.response?.data?.message?.includes('Current password is incorrect'));
    
    // Solo hacer logout si es 401 Y NO es error de contraseña
    if (error.response?.status === 401 && !isPasswordError) {
      if (typeof window !== 'undefined') {
        // Limpiar localStorage
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-permissions');
        
        // Limpiar cookies
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Limpiar estado de Zustand
        try {
          localStorage.removeItem('auth-storage');
        } catch (e) {
          console.warn('Error clearing auth storage:', e);
        }
        
        // Redirigir al login solo si no estamos ya allí
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?message=session-expired';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
