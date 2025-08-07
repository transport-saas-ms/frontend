'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTripWithExpenses, useDeleteTrip } from '@/hooks/useTrips';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, formatDate, formatDateTime, safeNumber } from '@/lib/utils';
import { formatExpensesTotal } from '@/lib/expenseUtils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

export const TripDetail: React.FC = () => {
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const tripId = params.id as string;

  const { data: trip, isLoading, error } = useTripWithExpenses(tripId);
  const deleteTrip = useDeleteTrip();

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
      deleteTrip.mutate(tripId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'En progreso' },
      COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completado' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
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
      TOLLS: { color: 'bg-yellow-100 text-yellow-800', label: 'Peajes' },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {trip.title}
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Estado: </span>
              <div className="ml-2">{getStatusBadge(trip.status)}</div>
            </div>
            {trip.distance && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>Distancia: {trip.distance} km</span>
              </div>
            )}
            {trip.startDate && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>Fecha: {formatDate(trip.startDate)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Link href="/trips">
            <Button variant="ghost">Volver</Button>
          </Link>
          {canEdit && (
            <Link href={`/trips/${trip.id}/edit`}>
              <Button variant="secondary">Editar</Button>
            </Link>
          )}
          {canDelete && (
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteTrip.isPending}
            >
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Información del viaje */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Información del Viaje
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detalles y especificaciones del viaje.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Título del Viaje</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {trip.title}
              </dd>
            </div>
            {trip.origin && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Origen</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {trip.origin}
                </dd>
              </div>
            )}
            {trip.destination && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Destino</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {trip.destination}
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Conductor</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {trip.driver?.name || 'No asignado'}
              </dd>
            </div>
            {trip.vehicle && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Vehículo</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {`${trip.vehicle.brand} ${trip.vehicle.model} (${trip.vehicle.plate})`}
                </dd>
              </div>
            )}
            {trip.startDate && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de inicio</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateTime(trip.startDate)}
                </dd>
              </div>
            )}
            {trip.endDate && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de finalización</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateTime(trip.endDate)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Gastos asociados */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Gastos del Viaje
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Lista de todos los gastos registrados para este viaje.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">Total: </span>
                <span className="font-medium text-lg text-gray-900">
                  {trip.expenses ? formatExpensesTotal(trip.expenses, true) : '$0.00'}
                </span>
              </div>
              <Link href={`/expenses/new?tripId=${trip.id}`}>
                <Button size="sm">Agregar Gasto</Button>
              </Link>
            </div>
          </div>
        </div>
        {trip.expenses && trip.expenses.length > 0 ? (
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {trip.expenses.map((expense) => (
                <li key={expense.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getCategoryBadge(expense.category)}
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
        ) : (
          <div className="border-t border-gray-200 px-4 py-8 text-center">
            <p className="text-gray-500">No hay gastos registrados para este viaje.</p>
            <Link href={`/expenses/new?tripId=${trip.id}`}>
              <Button className="mt-4" size="sm">
                Agregar Primer Gasto
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
