'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTripWithExpenses } from '@/hooks/useTrips';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, formatDate, formatDateTime, safeNumber } from '@/lib/utils';
import { formatExpensesTotal } from '@/lib/expenseUtils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { DeleteTripButton } from '@/components/trips/DeleteTripButton';

export const TripDetail: React.FC = () => {
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const tripId = params.id as string;

  const { data: trip, isLoading, error } = useTripWithExpenses(tripId);

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

  const getCategoryBadge = (category?: string) => {
    if (!category) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Sin categoría
        </span>
      );
    }

    const categoryConfig = {
      FUEL: { color: 'bg-red-100 text-red-800', label: 'Combustible' },
      MAINTENANCE: { color: 'bg-blue-100 text-blue-800', label: 'Mantenimiento' },
      TOLL: { color: 'bg-yellow-100 text-yellow-800', label: 'Peajes' },
      FOOD: { color: 'bg-green-100 text-green-800', label: 'Comida' },
      ACCOMMODATION: { color: 'bg-purple-100 text-purple-800', label: 'Alojamiento' },
      OTHER: { color: 'bg-gray-100 text-gray-800', label: 'Otro' },
    };

    const config = categoryConfig[category as keyof typeof categoryConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {config?.label || category}
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

  if (error || !trip) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar el viaje</p>
        <Link href="/trips">
          <Button className="mt-4">Volver a viajes</Button>
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.id === trip.driverId;
  const canDelete = user?.role === 'ADMIN';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Mobile First */}
      <div className="space-y-4 md:space-y-0">
        {/* Title and back button */}
        <div className="flex items-center space-x-3">
          <Link href="/trips">
            <Button variant="ghost" size="sm" className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 truncate md:text-2xl lg:text-3xl">
            {trip.title}
          </h1>
        </div>

        {/* Status and info cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-xs text-gray-500 mb-1">Estado</div>
            {getStatusBadge(trip.status)}
          </div>
          {trip.distance && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-1">Distancia</div>
              <div className="text-sm font-medium text-gray-900">{trip.distance} km</div>
            </div>
          )}
          {trip.startDate && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-1">Fecha</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(trip.startDate)}</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 md:justify-end">
          {canEdit && (
            <Link href={`/trips/${trip.id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full sm:w-auto">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            </Link>
          )}
          
          {canDelete && (
            <div className="flex-1 sm:flex-none">
              <DeleteTripButton 
                trip={trip}
                buttonVariant="danger"
                showIcon={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Información del viaje - Mobile First */}
      <div className="bg-white rounded-lg border border-gray-200 md:shadow md:overflow-hidden">
        <div className="p-4 md:px-6 md:py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Información del Viaje
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Detalles y especificaciones del viaje.
          </p>
        </div>
        
        <div className="p-4 md:p-0">
          <div className="space-y-4 md:space-y-0 md:divide-y md:divide-gray-200">
            {/* Título */}
            <div className="bg-gray-50 rounded-lg p-3 md:bg-transparent md:rounded-none md:p-4 md:py-5 md:grid md:grid-cols-3 md:gap-4 lg:px-6">
              <div className="text-sm font-medium text-gray-500 mb-1 md:mb-0">Título del Viaje</div>
              <div className="text-sm text-gray-900 font-medium md:font-normal md:col-span-2">
                {trip.title}
              </div>
            </div>

            {/* Origen */}
            {trip.origin && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 md:border-0 md:rounded-none md:p-4 md:py-5 md:grid md:grid-cols-3 md:gap-4 lg:px-6">
                <div className="text-sm font-medium text-gray-500 mb-1 md:mb-0">Origen</div>
                <div className="text-sm text-gray-900 font-medium md:font-normal md:col-span-2">
                  {trip.origin}
                </div>
              </div>
            )}

            {/* Destino */}
            {trip.destination && (
              <div className="bg-gray-50 rounded-lg p-3 md:bg-transparent md:rounded-none md:p-4 md:py-5 md:grid md:grid-cols-3 md:gap-4 lg:px-6">
                <div className="text-sm font-medium text-gray-500 mb-1 md:mb-0">Destino</div>
                <div className="text-sm text-gray-900 font-medium md:font-normal md:col-span-2">
                  {trip.destination}
                </div>
              </div>
            )}

            {/* Conductor */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 md:border-0 md:rounded-none md:p-4 md:py-5 md:grid md:grid-cols-3 md:gap-4 lg:px-6">
              <div className="text-sm font-medium text-gray-500 mb-1 md:mb-0">Conductor</div>
              <div className="text-sm text-gray-900 font-medium md:font-normal md:col-span-2">
                {trip.driver?.name || 'No asignado'}
              </div>
            </div>

            {/* Fecha de inicio */}
            {trip.startDate && (
              <div className="bg-gray-50 rounded-lg p-3 md:bg-transparent md:rounded-none md:p-4 md:py-5 md:grid md:grid-cols-3 md:gap-4 lg:px-6">
                <div className="text-sm font-medium text-gray-500 mb-1 md:mb-0">Fecha de inicio</div>
                <div className="text-sm text-gray-900 font-medium md:font-normal md:col-span-2">
                  {formatDateTime(trip.startDate)}
                </div>
              </div>
            )}

            {/* Fecha de finalización */}
            {trip.endDate && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 md:border-0 md:rounded-none md:p-4 md:py-5 md:grid md:grid-cols-3 md:gap-4 lg:px-6">
                <div className="text-sm font-medium text-gray-500 mb-1 md:mb-0">Fecha de finalización</div>
                <div className="text-sm text-gray-900 font-medium md:font-normal md:col-span-2">
                  {formatDateTime(trip.endDate)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gastos asociados - Mobile First */}
      <div className="bg-white rounded-lg border border-gray-200 md:shadow md:overflow-hidden">
        <div className="p-4 md:px-6 md:py-5 border-b border-gray-200">
          <div className="space-y-4 md:space-y-0 md:flex md:justify-between md:items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Gastos del Viaje
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Lista de todos los gastos registrados para este viaje.
              </p>
            </div>
            
            {/* Total y botón agregar */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center md:flex-col md:space-x-0 md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center sm:text-left md:text-center lg:text-left">
                <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total</div>
                <div className="text-lg font-bold text-blue-900 md:text-xl">
                  {trip.expenses ? formatExpensesTotal(trip.expenses, true) : '$0.00'}
                </div>
              </div>
              <Link href={`/expenses/new?tripId=${trip.id}`} className="flex-1 sm:flex-none">
                <Button size="sm" className="w-full sm:w-auto">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Gasto
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {trip.expenses && trip.expenses.length > 0 ? (
          <div className="p-4 md:p-0">
            {/* Vista móvil - Cards */}
            <div className="space-y-3 md:hidden">
              {trip.expenses.map((expense) => (
                <div key={expense.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getCategoryBadge(expense.type)}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {expense.description}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(expense.date)} • {expense.user?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(safeNumber(expense.amount))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Lista */}
            <div className="hidden md:block border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {trip.expenses.map((expense) => (
                  <li key={expense.id} className="px-4 py-4 lg:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getCategoryBadge(expense.type)}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(expense.date)} • {expense.user?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(safeNumber(expense.amount))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6 md:px-4 md:py-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No hay gastos registrados para este viaje.</p>
            <Link href={`/expenses/new?tripId=${trip.id}`}>
              <Button size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Primer Gasto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
