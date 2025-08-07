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
    // Si el token ha expirado (401), hacer logout completo
    if (error.response?.status === 401) {
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
        
        // Mostrar mensaje al usuario
        console.warn('Sesión expirada. Redirigiendo al login...');
        
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
