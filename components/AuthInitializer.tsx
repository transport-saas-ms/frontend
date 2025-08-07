'use client';

import React from 'react';
import { useAuthMe } from '@/hooks/useAuthMe';
import { useAuthStore } from '@/store/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { data, isLoading, error } = useAuthMe();
  const { isAuthenticated, setUserProfile } = useAuthStore();

  // Solo cargar perfil si estamos autenticados pero no tenemos datos del usuario
  React.useEffect(() => {
    if (data?.user && data?.permissions) {
      setUserProfile(data.user, data.permissions);
    }
  }, [data, setUserProfile]);

  // Si estamos autenticados pero cargando el perfil, mostrar loading
  if (isAuthenticated && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando perfil de usuario...</p>
        </div>
      </div>
    );
  }

  // Si hay error al cargar el perfil pero estamos autenticados
  if (isAuthenticated && error) {
    console.error('Error loading user profile:', error);
    // Continuar sin el perfil, se cargará en el dashboard
  }

  return <>{children}</>;
};
