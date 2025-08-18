'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUsers';
import { UserFilters, UserRole } from '@/lib/types/index';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
    sortBy: 'name', // Ordenar por nombre por defecto
    sortOrder: 'asc', // Orden ascendente por defecto
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  // Contar filtros activos
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.search || searchInput) count++;
    if (filters.role) count++;
    // sortBy y sortOrder no cuentan como filtros activos ya que siempre tienen valores por defecto
    return count;
  }, [filters.search, searchInput, filters.role]);

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
        <p className="text-gray-500 mb-6">
          No se encontraron usuarios en tu compañía.
        </p>
        <Link href="/users/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear primer usuario
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Mobile First */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="md:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Usuarios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona los usuarios de tu compañía.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Botón de filtros */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          
          {/* Botón nuevo usuario */}
          <Link href="/users/new">
            <Button size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros colapsables */}
      {showFilters && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filtrar usuarios</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Input
              label="Buscar"
              placeholder="Buscar por nombre o email..."
              value={searchInput}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <UserRoleSelect
              label="Rol"
              value={filters.role || ''}
              onChange={(value) => handleFilterChange('role', value)}
              placeholder="Todos los roles"
            />
            <Select
              label="Ordenar por"
              options={[
                { value: 'name', label: 'Nombre' },
                { value: 'createdAt', label: 'Fecha' }
              ]}
              value={filters.sortBy || 'name'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            />
            <Select
              label="Orden"
              options={[
                { value: 'asc', label: '↑ Ascendente' },
                { value: 'desc', label: '↓ Descendente' }
              ]}
              value={filters.sortOrder || 'asc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="space-y-4 md:space-y-0 md:bg-white md:shadow-sm md:rounded-lg md:overflow-hidden">
        {/* Vista móvil: Cards individuales */}
        <div className="md:hidden space-y-4">
          {data.users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-3">
                {/* Header del card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {user.name[0]?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-medium text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getRoleBadge(user.role)}
                  </div>
                </div>

                {/* Detalles del usuario */}
                {user.createdAt && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Registrado:</span>
                    <span className="ml-2">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Footer del card - Acciones */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link href={`/users/${user.id}`}>
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link href={`/users/${user.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                    </Link>
                    <DeleteUserButton
                      user={user}
                      buttonSize="sm"
                      buttonVariant="ghost"
                      buttonText=""
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop: Tabla tradicional */}
        <div className="hidden md:block overflow-x-auto">
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
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.name[0]?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
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
          <div className="bg-white p-4 md:px-6 md:py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between md:hidden">
              <Button
                variant="ghost"
                disabled={!filters.page || filters.page <= 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                size="sm"
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700 flex items-center">
                {filters.page || 1} de {data.totalPages}
              </span>
              <Button
                variant="ghost"
                disabled={(filters.page || 1) >= data.totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                size="sm"
              >
                Siguiente
              </Button>
            </div>
            
            <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
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
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${
                          filters.page === page
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
