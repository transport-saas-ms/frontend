'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTripsWithExpenses } from '@/hooks/useTrips';
import { TripFilters, Trip } from '@/lib/types/index';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { TripStatusSelect } from '@/components/trips/TripStatusSelect';
import { formatExpensesTotal } from '@/lib/expenseUtils';
import { useAuthStore } from '@/store/auth';
import { usePermissions } from '@/hooks/useAuthMe';
import { CAPABILITIES } from '@/lib/permissions';

export const TripsList: React.FC = () => {
  const [filters, setFilters] = useState<TripFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuthStore();
  const { hasCapability, isDriver } = usePermissions();
  const { data, isLoading, error } = useTripsWithExpenses(filters);

  // Determinar si el usuario es un chofer y debe ver solo sus viajes
  const isDriverUser = useMemo(() => {
    return isDriver && hasCapability(CAPABILITIES.VIEW_OWN_TRIPS);
  }, [isDriver, hasCapability]);

  // Filtrar viajes según el rol del usuario
  const filteredTrips = useMemo(() => {
    if (!data?.trips) return [];
    
    // Si es un chofer, solo mostrar sus viajes asignados
    if (isDriverUser && user) {
      return data.trips.filter((trip: Trip) => trip.driverId === user.id);
    }
    
    // Para otros roles, mostrar todos los viajes
    return data.trips;
  }, [data?.trips, isDriverUser, user]);

  // Verificar si puede crear nuevos viajes
  const canCreateTrip = useMemo(() => {
    return hasCapability(CAPABILITIES.CREATE_TRIP);
  }, [hasCapability]);

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En progreso' },
    { value: 'COMPLETED', label: 'Completado' },
  ];

  const handleFilterChange = (key: keyof TripFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1, // Reset page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters.status, filters.startDate, filters.endDate]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'En progreso' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar los viajes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="md:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Viajes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los viajes registrados en el sistema.
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
          
          {/* Botón nuevo viaje */}
          {canCreateTrip && (
            <Link href="/trips/new">
              <Button size="sm">Nuevo Viaje</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros colapsables */}
      {showFilters && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filtrar viajes</h3>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              label="Estado"
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
            <Input
              label="Fecha desde"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <Input
              label="Fecha hasta"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Lista de viajes */}
      {filteredTrips && filteredTrips.length > 0 ? (
        <div className="space-y-4 md:space-y-0 md:bg-white md:shadow md:overflow-hidden md:rounded-md">
          {/* Vista móvil: Cards individuales */}
          <div className="md:hidden space-y-4">
            {filteredTrips.map((trip: Trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <Link href={`/trips/${trip.id}`} className="block">
                  <div className="space-y-3">
                    {/* Header del card */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-lg">
                              {trip.title[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-medium text-gray-900 truncate">
                            {trip.title}
                          </h3>
                          <div className="mt-1">
                            {getStatusBadge(trip.status)}
                          </div>
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    {/* Detalles del viaje */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {trip.distance && (
                        <div className="flex items-center">
                          <span className="font-medium">Distancia:</span>
                          <span className="ml-2">{trip.distance} km</span>
                        </div>
                      )}
                      {trip.startDate && (
                        <div className="flex items-center">
                          <span className="font-medium">Fecha:</span>
                          <span className="ml-2">{new Date(trip.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {trip.driver && (
                        <div className="flex items-center">
                          <span className="font-medium">Conductor:</span>
                          <span className="ml-2">{trip.driver.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer del card */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="text-lg font-semibold text-gray-900">
                        {trip.expenses ? formatExpensesTotal(trip.expenses) : '$0.00'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total gastos
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Select de estado - Solo móvil */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <TripStatusSelect 
                    trip={trip}
                    size="sm"
                    showLabel={true}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop: Lista tradicional */}
          <ul className="hidden md:block divide-y divide-gray-200">
            {filteredTrips.map((trip: Trip) => (
              <li key={trip.id} className="bg-white">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Link href={`/trips/${trip.id}`} className="block hover:bg-gray-50 transition-colors rounded-lg px-4 py-2 -mx-4 -my-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {trip.title[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {trip.title}
                            </p>
                            <div className="ml-2">
                              {getStatusBadge(trip.status)}
                            </div>
                          </div>
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">
                              {trip.distance ? `${trip.distance} km • ` : ''}
                              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : ''}
                              {trip.driver && ` • ${trip.driver.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          {trip.expenses ? formatExpensesTotal(trip.expenses) : '$0.00'}
                        </div>
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Select de estado del viaje - Desktop */}
                  <div className="ml-4 flex-shrink-0">
                    <TripStatusSelect 
                      trip={trip}
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

                    {/* Paginación */}
          {data && data.totalPages && data.totalPages > 1 && (
            <div className="bg-white p-4 md:px-6 md:py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                  size="sm"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700 flex items-center">
                  {filters.page} de {data.totalPages}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === data.totalPages}
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {(filters.page! - 1) * filters.limit! + 1}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(filters.page! * filters.limit!, data.total || 0)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{data.total || 0}</span>{' '}
                    resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: data.totalPages || 0 }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`${
                          filters.page === i + 1
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No hay viajes"
          description={isDriverUser ? "No tienes viajes asignados." : "Comienza creando tu primer viaje."}
          action={
            canCreateTrip ? (
              <Link href="/trips/new">
                <Button>Crear Viaje</Button>
              </Link>
            ) : undefined
          }
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          }
        />
      )}
    </div>
  );
};
