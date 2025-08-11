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
      <div className="space-y-6">
        {/* Header */}
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

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuario</h3>
            <p className="text-gray-500 mb-4">
              No se pudo cargar la información del usuario.
            </p>
            <Link href="/users">
              <Button variant="secondary">Volver a usuarios</Button>
            </Link>
          </div>
        ) : user ? (
          <>
            {/* Formulario */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <UserForm mode="edit" initialData={user} />
            </div>

            {/* Información adicional */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-800 mb-2">⚠️ Consideraciones importantes</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Los cambios de rol se aplicarán inmediatamente</li>
                <li>• El usuario puede perder acceso a ciertas funciones si cambias su rol</li>
                <li>• Para cambiar la contraseña, usa la opción en el perfil del usuario</li>
                <li>• No puedes cambiar el email a uno que ya esté registrado</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Usuario no encontrado</h3>
            <p className="text-gray-500 mb-4">
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
