'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';

export const NoPermissionsView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Transport SaaS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {user?.name} ({user?.role})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  loading={logout.isPending}
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal - Mensaje de sin permisos */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
              <svg
                className="h-12 w-12 text-yellow-600"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido{user?.name ? `, ${user.name}` : ''}!
            </h1>
            <div className="max-w-md mx-auto">
              <p className="text-lg text-gray-600 mb-6">
                No tienes permisos para acceder al dashboard en este momento.
                Por favor, espera a ser agregado a una compañía.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Un administrador debe asignarte a una compañía para que puedas
                      acceder a las funcionalidades del sistema.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
              <Button
                onClick={handleLogout}
                loading={logout.isPending}
                className="w-full sm:w-auto"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
