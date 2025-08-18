'use client';

import React from 'react';
import { useTripsWithExpenses } from '@/hooks/useTrips';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuthStore } from '@/store/auth';
import { formatCurrencyWithCode } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Trip, ExpenseByCurrency } from '@/lib/types/index';

export const DashboardStats: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  // Obtener datos enriquecidos con gastos para estadísticas más precisas
  const { data: tripsWithExpensesData, isLoading: tripsLoading, error: tripsError } = useTripsWithExpenses({ 
    limit: 1,
    page: 1 
  });
  
  const { data: expensesData, isLoading: expensesLoading, error: expensesError } = useExpenses({ 
    limit: 1,
    page: 1 
  });

  const { data: recentTripsData, isLoading: recentTripsLoading } = useTripsWithExpenses({ 
    limit: 5,
    page: 1 
  });

  if (tripsLoading || expensesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mostrar errores de las APIs
  if (tripsError || expensesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-red-800">
          Error al cargar datos del dashboard
        </h3>
        <div className="mt-2 text-sm text-red-700">
          {tripsError && <p>Viajes: {tripsError instanceof Error ? tripsError.message : 'Error desconocido'}</p>}
          {expensesError && <p>Gastos: {expensesError instanceof Error ? expensesError.message : 'Error desconocido'}</p>}
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total de Viajes',
      value: tripsWithExpensesData?.total || 0,
      icon: '🚗',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total de Gastos',
      value: expensesData?.total || 0,
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Viajes Activos',
      value: tripsWithExpensesData?.trips?.filter((trip: Trip) => trip.status === 'IN_PROGRESS').length || 0,
      icon: '🔄',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Viajes Completados',
      value: tripsWithExpensesData?.trips?.filter((trip: Trip) => trip.status === 'COMPLETED').length || 0,
      icon: '✅',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Saludo y estadísticas Mobile First */}
      <div className="text-center md:text-left">
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600 md:text-base">
          Aquí tienes un resumen de tu actividad reciente.
        </p>
      </div>

      {/* Grid de estadísticas Mobile First */}
      <div className="grid grid-cols-2 gap-3 md:gap-5">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg border border-gray-200 p-4 md:pt-5 md:px-4 md:pb-12 md:shadow md:border-0 overflow-hidden"
          >
            <div className="space-y-2 md:space-y-0">
              {/* Mobile: Layout vertical compacto */}
              <div className="flex items-center justify-center md:block md:relative">
                <div className={`rounded-md p-2 md:p-3 ${stat.bgColor} md:absolute`}>
                  <span className="text-lg md:text-xl">{stat.icon}</span>
                </div>
              </div>
              
              <div className="text-center md:text-left md:ml-16">
                <p className="text-xs font-medium text-gray-500 truncate md:text-sm">
                  {stat.name}
                </p>
                <p className={`text-lg font-semibold ${stat.color} md:text-2xl md:mt-2`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gastos por moneda Mobile First */}
      {tripsWithExpensesData?.trips && tripsWithExpensesData.trips.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:shadow md:border-0 md:p-6">
          <h3 className="text-base font-medium text-gray-900 mb-3 md:text-lg md:mb-4">
            Gastos por Moneda
          </h3>
          <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
            {tripsWithExpensesData.trips
              .slice(0, 5)
              .filter((trip: Trip) => trip.expensesByCurrency && trip.expensesByCurrency.length > 0)
              .flatMap((trip: Trip) => trip.expensesByCurrency || [])
              .reduce((acc: ExpenseByCurrency[], expenseGroup: ExpenseByCurrency) => {
                const existing = acc.find((item: ExpenseByCurrency) => item.currency === expenseGroup.currency);
                if (existing) {
                  existing.total += expenseGroup.total;
                  existing.count += expenseGroup.count;
                } else {
                  acc.push({ ...expenseGroup });
                }
                return acc;
              }, [])
              .map((currencyGroup: ExpenseByCurrency) => (
                <div key={currencyGroup.currency} className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {currencyGroup.currency}
                    </span>
                    <span className="text-base font-semibold text-blue-600 md:text-lg">
                      {formatCurrencyWithCode(currencyGroup.total, currencyGroup.currency)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {currencyGroup.count} gasto{currencyGroup.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            {tripsWithExpensesData.trips
              .slice(0, 5)
              .filter((trip: Trip) => trip.expensesByCurrency && trip.expensesByCurrency.length > 0)
              .flatMap((trip: Trip) => trip.expensesByCurrency || []).length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm md:col-span-full">
                No hay gastos registrados en los viajes recientes.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Viajes recientes Mobile First */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:shadow md:border-0 md:p-6">
        <h3 className="text-base font-medium text-gray-900 mb-3 md:text-lg md:mb-4">
          Viajes Recientes
        </h3>
        {recentTripsLoading ? (
          <div className="flex justify-center py-6 md:py-8">
            <LoadingSpinner />
          </div>
        ) : recentTripsData && recentTripsData.trips && recentTripsData.trips.length > 0 ? (
          <div className="space-y-3 md:flow-root">
            {/* Vista móvil: Cards compactas */}
            <div className="md:hidden space-y-3">
              {recentTripsData.trips.map((trip: Trip) => (
                <div key={trip.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${trip.status === 'COMPLETED' ? 'bg-green-500' : 
                        trip.status === 'IN_PROGRESS' ? 'bg-blue-500' : 
                        trip.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'}
                    `}>
                      <span className="text-white text-sm">
                        {trip.status === 'COMPLETED' ? '✓' : 
                         trip.status === 'IN_PROGRESS' ? '→' : 
                         trip.status === 'PENDING' ? '⏸' : '✗'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {trip.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {trip.distance ? `${trip.distance} km • ` : ''}{trip.status}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(trip.createdAt).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop: Timeline tradicional */}
            <ul className="hidden md:block -mb-8">
              {recentTripsData.trips.map((trip: Trip, tripIdx: number) => (
                <li key={trip.id}>
                  <div className="relative pb-8">
                    {tripIdx !== recentTripsData.trips.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`
                          h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                          ${trip.status === 'COMPLETED' ? 'bg-green-500' : 
                            trip.status === 'IN_PROGRESS' ? 'bg-blue-500' : 
                            trip.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-500'}
                        `}>
                          <span className="text-white text-sm">
                            {trip.status === 'COMPLETED' ? '✓' : 
                             trip.status === 'IN_PROGRESS' ? '→' : 
                             trip.status === 'PENDING' ? '⏸' : '✗'}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              {trip.title}
                            </span>
                          </p>
                          <p className="text-xs text-gray-400">
                            {trip.distance ? `${trip.distance} km • ` : ''}{trip.status}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={trip.createdAt}>
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 text-sm md:py-8">
            No hay viajes registrados aún.
          </p>
        )}
      </div>
    </div>
  );
};
