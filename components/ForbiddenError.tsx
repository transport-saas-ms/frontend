'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useLogout } from '@/hooks/useAuth';

interface ForbiddenErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const ForbiddenError: React.FC<ForbiddenErrorProps> = ({
  message = 'No tienes permisos para realizar esta acción',
  onRetry,
}) => {
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="space-y-3">
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="secondary"
                className="w-full"
              >
                Intentar de nuevo
              </Button>
            )}
            <Button
              onClick={handleLogout}
              loading={logout.isPending}
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
