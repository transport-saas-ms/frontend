'use client';

import React from 'react';
import Link from 'next/link';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { UserForm } from '@/components/users/UserForm';
import { useUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROLES } from '@/lib/permissions';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = React.use(params);
  const { data: user, isLoading, error } = useUser(resolvedParams.id);

  return (
    <PageWithPermissions
      requiredRoles={[ROLES.ADMIN]}
      forbiddenMessage="Solo los administradores pueden editar usuarios."
    >
      <div className="space-y-4 md:space-y-6">
        {/* Header Mobile First - Solo visible en desktop */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isLoading ? 'Cargando...' : `Editar usuario: ${user?.name || 'Usuario'}`}
              </h1>
              <p className="mt-2 text-gray-600">
                Modifica la información y rol del usuario en tu compañía.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href={`/users/${resolvedParams.id}`}>
                <Button variant="secondary">
                  Ver perfil
                </Button>
              </Link>
              <Link href="/users">
                <Button variant="secondary">
                  ← Volver a usuarios
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:shadow-sm text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuario</h3>
            <p className="text-gray-500 mb-6">
              No se pudo cargar la información del usuario.
            </p>
            <Link href="/users">
              <Button variant="secondary">Volver a usuarios</Button>
            </Link>
          </div>
        ) : user ? (
          <>
            {/* Formulario - Ya es mobile-first */}
            <UserForm mode="edit" initialData={user} />

            {/* Información adicional - Mobile First */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800 mb-3 md:mb-2">
                    Consideraciones importantes
                  </h3>
                  <div className="space-y-2 md:space-y-1">
                    <div className="flex items-start space-x-2 text-sm text-amber-700">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Los cambios de rol se aplicarán inmediatamente</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm text-amber-700">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>El usuario puede perder acceso a ciertas funciones si cambias su rol</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm text-amber-700">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Para cambiar la contraseña, usa la opción en el perfil del usuario</span>
                    </div>
                    <div className="flex items-start space-x-2 text-sm text-amber-700">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>No puedes cambiar el email a uno que ya esté registrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones adicionales solo en móvil */}
            <div className="md:hidden bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Acciones adicionales</h3>
              <div className="flex flex-col space-y-3">
                <Link href={`/users/${resolvedParams.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver perfil del usuario
                  </Button>
                </Link>
                <Link href="/users" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Volver a usuarios
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:shadow-sm text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Usuario no encontrado</h3>
            <p className="text-gray-500 mb-6">
              El usuario que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/users">
              <Button variant="secondary">Volver a usuarios</Button>
            </Link>
          </div>
        )}
      </div>
    </PageWithPermissions>
  );
}
