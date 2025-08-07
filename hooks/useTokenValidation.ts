import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

// Función para verificar si el token ha expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    return payload.exp < now;
  } catch {
    // Si no se puede decodificar, considerar como expirado
    return true;
  }
}

// Hook para validar el token automáticamente
export function useTokenValidation() {
  const router = useRouter();
  const { token, isAuthenticated, forceLogout } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const checkTokenValidity = () => {
      if (isAuthenticated && token) {
        if (isTokenExpired(token)) {
          console.warn('Token expirado detectado, cerrando sesión...');
          forceLogout();
          
          // Redirigir al login con mensaje
          if (!window.location.pathname.includes('/login')) {
            router.push('/login?message=session-expired');
          }
        }
      }
    };

    // Verificar inmediatamente
    checkTokenValidity();

    // Verificar cada 60 segundos
    intervalRef.current = setInterval(checkTokenValidity, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, isAuthenticated, forceLogout, router]);

  // Función para verificar token manualmente
  const validateToken = () => {
    if (token && isTokenExpired(token)) {
      forceLogout();
      router.push('/login?message=session-expired');
      return false;
    }
    return true;
  };

  return { validateToken };
}
