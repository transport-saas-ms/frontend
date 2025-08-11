'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useLogout } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/useAuthMe';
import { Button } from '@/components/ui/Button';
import { NoPermissionsView } from '@/components/NoPermissionsView';
import { ForbiddenError } from '@/components/ForbiddenError';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PermissionsDebugger } from '@/components/dev/PermissionsDebugger';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Viajes', href: '/trips', icon: '🚗' },
  { name: 'Gastos', href: '/expenses', icon: '💰' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { isUserWithoutPermissions, permissions, error } = usePermissions();

  // Agregar "Usuarios" solo para ADMIN
  const getNavigationItems = () => {
    const baseNavigation = [...navigation];
    
    if (user?.role === 'ADMIN') {
      baseNavigation.push({ 
        name: 'Usuarios', 
        href: '/users', 
        icon: '👥' 
      });
    }
    
    return baseNavigation;
  };

  const handleLogout = () => {
    logout.mutate();
  };

  // Mostrar loading mientras se cargan los permisos
  if (permissions === undefined && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si hay un error 403 específico del servidor
  if (error && typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response: { status: number } };
    if (axiosError.response?.status === 403) {
      return (
        <ForbiddenError 
          message="No tienes permisos para acceder al dashboard. Espera a ser agregado a una compañía."
        />
      );
    }
  }

  // Si es un usuario sin permisos, mostrar vista específica
  if (isUserWithoutPermissions()) {
    return <NoPermissionsView />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación superior */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Transport SaaS
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavigationItems().map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
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

      {/* Navegación móvil */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Contenido principal */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Debugger de permisos (solo en desarrollo) */}
      <PermissionsDebugger />
    </div>
  );
};
