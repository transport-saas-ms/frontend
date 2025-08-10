'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseFilters } from '@/lib/types';
import { formatCurrency, formatDate, safeNumber } from '@/lib/utils';
import { formatExpensesTotal } from '@/lib/expenseUtils';
import { LoadingSpinner, EmptyState } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { DeleteExpenseButton } from '@/components/expenses/DeleteExpenseButton';

export const ExpensesList: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useExpenses(filters);

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    { value: 'FUEL', label: 'Combustible' },
    { value: 'TOLL', label: 'Peajes' },
    { value: 'FOOD', label: 'Comida' },
    { value: 'RAPAIR', label: 'Arreglos' },
    { value: 'OTHER', label: 'Otro' },
  ];

  const handleFilterChange = (key: keyof ExpenseFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1, // Reset page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error al cargar los gastos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Gastos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los gastos registrados en el sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link href="/expenses/new">
            <Button>Nuevo Gasto</Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Select
            label="Categoría"
            options={categoryOptions}
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          />
          <Input
            label="ID del Viaje"
            type="text"
            placeholder="Filtrar por viaje"
            value={filters.tripId || ''}
            onChange={(e) => handleFilterChange('tripId', e.target.value)}
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

      {/* Lista de gastos */}
      {data && data.expenses?.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {data.expenses.map((expense) => (
              <li key={expense.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">$</span>
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {expense.description}
                        </p>
                        <div className="ml-2">
                          {getCategoryBadge(expense.category)}
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          {formatDate(expense.date)}
                          {expense.user && ` • ${expense.user.name}`}
                          {expense.trip && (
                            <>
                              {' • '}
                              <Link 
                                href={`/trips/${expense.trip.id}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {expense.trip.title}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(safeNumber(expense.amount))}
                    </p>
                    {expense.receiptUrl && (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    )}
                    <DeleteExpenseButton 
                      expense={expense}
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
          {data.totalPages > 1 && (
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
                      {Math.min(filters.page! * filters.limit!, data.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{data.total}</span>{' '}
                    resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: data.totalPages }, (_, i) => (
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

          {/* Total de gastos */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Total de gastos mostrados:
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {data.expenses ? formatExpensesTotal(data.expenses, true) : '$0.00'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No hay gastos"
          description="Comienza registrando tu primer gasto."
          action={
            <Link href="/expenses/new">
              <Button>Registrar Gasto</Button>
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />
      )}
    </div>
  );
};
