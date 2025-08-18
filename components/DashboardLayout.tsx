'use client';

import React, { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const closeSidebar = () => {
    setSidebarOpen(false);
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
      {/* Overlay para móvil cuando sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity md:hidden z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-lg font-bold text-gray-900">Transport SaaS</h1>
            {/* Botón cerrar solo en móvil */}
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={closeSidebar}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {getNavigationItems().map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer del sidebar - Info del usuario */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              loading={logout.isPending}
              className="w-full mt-3 justify-start"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Header móvil */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Transport SaaS</h1>
          <div className="w-10" /> {/* Spacer para centrar el título */}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="md:pl-64">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Debugger de permisos (solo en desarrollo) */}
      <PermissionsDebugger />
    </div>
  );
};
