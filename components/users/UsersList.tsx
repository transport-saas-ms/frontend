'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUsers';
import { UserFilters, UserRole } from '@/lib/types/index';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserRoleSelect } from '@/components/users/UserRoleSelect';
import { DeleteUserButton } from '@/components/users/DeleteUserButton';

// Hook para debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const UsersList: React.FC = () => {
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  });

  // Estado local para el input de búsqueda (para UI responsiva)
  const [searchInput, setSearchInput] = useState('');
  
  // Debounce del search para evitar requests excesivos
  const debouncedSearch = useDebounce(searchInput, 1000);

  // Aplicar el search debounced a los filtros
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch || undefined,
      page: 1, // Reset page when searching
    }));
  }, [debouncedSearch]);

  const { data, isLoading, error } = useUsers(filters);

  const handleFilterChange = (key: keyof UserFilters, value: string | number) => {
    if (key === 'search') {
      // Para search, solo actualizar el input local
      setSearchInput(value as string);
    } else {
      // Para otros filtros, actualizar inmediatamente
      setFilters(prev => ({
        ...prev,
        [key]: value === '' ? undefined : value,
        page: 1, // Reset page when filtering
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      ADMIN: { color: 'bg-red-100 text-red-800', label: 'Administrador' },
      ACCOUNTANT: { color: 'bg-blue-100 text-blue-800', label: 'Contador' },
      DRIVER: { color: 'bg-green-100 text-green-800', label: 'Conductor' },
      USER: { color: 'bg-gray-100 text-gray-800', label: 'Usuario' },
    };

    const config = roleConfig[role];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar usuarios</p>
        <Button 
          variant="ghost" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data?.users?.length) {
    return (
      <EmptyState
        title="No hay usuarios"
        description="No se encontraron usuarios en tu compañía"
        action={
          <Link href="/users/new">
            <Button>Crear primer usuario</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <UserRoleSelect
            value={filters.role || ''}
            onChange={(value) => handleFilterChange('role', value)}
            placeholder="Todos los roles"
          />
          <div className="flex justify-end">
            <Link href="/users/new">
              <Button>
                + Agregar usuario
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Ver detalles'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <DeleteUserButton
                        user={user}
                        buttonSize="sm"
                        buttonVariant="ghost"
                        buttonText="Eliminar"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {data && data.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="secondary"
                disabled={!filters.page || filters.page <= 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                disabled={(filters.page || 1) >= data.totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                Siguiente
              </Button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">
                    {((filters.page || 1) - 1) * (filters.limit || 10) + 1}
                  </span> a <span className="font-medium">
                    {Math.min((filters.page || 1) * (filters.limit || 10), data.total)}
                  </span> de <span className="font-medium">{data.total}</span> usuarios
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!filters.page || filters.page <= 1}
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                  >
                    Anterior
                  </Button>
                  
                  {/* Números de página */}
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={(filters.page || 1) >= data.totalPages}
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                  >
                    Siguiente
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
