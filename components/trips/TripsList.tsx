'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTripsWithExpenses } from '@/hooks/useTrips';
import { TripFilters, Trip } from '@/lib/types';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { DeleteTripButton } from '@/components/trips/DeleteTripButton';
import { formatExpensesTotal } from '@/lib/expenseUtils';

export const TripsList: React.FC = () => {
  const [filters, setFilters] = useState<TripFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useTripsWithExpenses(filters);

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'En progreso' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completado' },
    //   CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Viajes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los viajes registrados en el sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link href="/trips/new">
            <Button>Nuevo Viaje</Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Lista de viajes */}
      {data && data.trips?.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {data.trips.map((trip: Trip) => (
              <li key={trip.id} className="bg-white">
                <div className="px-4 py-4 flex items-center justify-between">
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
                  
                  {/* Botón de eliminar */}
                  <div className="ml-4 flex-shrink-0">
                    <DeleteTripButton 
                      trip={trip}
                      buttonSize="sm"
                      buttonVariant="ghost"
                      showIcon={true}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginación */}
          {data.totalPages && data.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === data.totalPages}
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
          description="Comienza creando tu primer viaje."
          action={
            <Link href="/trips/new">
              <Button>Crear Viaje</Button>
            </Link>
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
