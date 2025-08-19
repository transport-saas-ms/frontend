"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useExpenses } from "@/hooks/useExpenses";
import { useTrips } from "@/hooks/useTrips";
import { useUsers } from "@/hooks/useUsers";
import { ExpenseFilters, Expense } from "@/lib/types/index";
import { formatCurrency, formatDate, safeNumber } from "@/lib/utils";
import { formatExpensesTotal } from "@/lib/expenseUtils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";
import { useAuthStore } from "@/store/auth";
import { usePermissions } from "@/hooks/useAuthMe";
import { CAPABILITIES } from "@/lib/permissions";

export const ExpensesList: React.FC = () => {
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuthStore();
  const { hasCapability, isDriver } = usePermissions();
  const { data, isLoading, error } = useExpenses(filters);

  // Obtener datos para los filtros
  const { data: tripsData } = useTrips({ page: 1, limit: 100 }); // Obtener más viajes para el filtro
  const { data: usersData } = useUsers({ page: 1, limit: 100 }); // Obtener usuarios para el filtro

  // Determinar si el usuario es un chofer y debe ver solo sus gastos
  const isDriverUser = useMemo(() => {
    return isDriver && hasCapability(CAPABILITIES.VIEW_OWN_EXPENSES);
  }, [isDriver, hasCapability]);

  // Filtrar gastos según el rol del usuario
  const filteredExpenses = useMemo(() => {
    if (!data?.expenses) return [];

    // Si es un chofer, solo mostrar sus gastos
    if (isDriverUser && user) {
      return data.expenses.filter(
        (expense: Expense) => expense.driverId === user.id
      );
    }

    // Para otros roles, mostrar todos los gastos
    return data.expenses;
  }, [data?.expenses, isDriverUser, user]);

  // Verificar si puede crear nuevos gastos
  const canCreateExpense = useMemo(() => {
    return (
      hasCapability(CAPABILITIES.CREATE_EXPENSE) ||
      hasCapability(CAPABILITIES.MANAGE_EXPENSES)
    );
  }, [hasCapability]);

  // Verificar si puede gestionar gastos (editar/eliminar)
  const canManageExpenses = useMemo(() => {
    return hasCapability(CAPABILITIES.MANAGE_EXPENSES);
  }, [hasCapability]);

  // Verificar si puede editar sus propios gastos (para drivers)
  const canEditOwnExpenses = useMemo(() => {
    return hasCapability(CAPABILITIES.UPDATE_OWN_EXPENSES);
  }, [hasCapability]);

  // Función para determinar si puede editar un gasto específico
  const canEditExpense = (expense: Expense): boolean => {
    // Admins/Accountants pueden editar todos los gastos
    if (canManageExpenses) return true;
    
    // Drivers pueden editar solo sus propios gastos
    if (canEditOwnExpenses && user && expense.driverId === user.id) return true;
    
    return false;
  };

  // Función para determinar si puede eliminar un gasto específico
  const canDeleteExpense = (): boolean => {
    // Solo admins/accountants pueden eliminar gastos
    // Los drivers no pueden eliminar, solo editar
    return canManageExpenses;
  };

  const typeOptions = [
    { value: "", label: "Todos los tipos" },
    { value: "FUEL", label: "Combustible" },
    { value: "TOLL", label: "Peajes" },
    { value: "FOOD", label: "Comida" },
    { value: "REPAIR", label: "Reparación" },
    { value: "OTHER", label: "Otro" },
  ];

  // Opciones para el filtro de viajes
  const tripOptions = useMemo(() => {
    const options = [{ value: "", label: "Todos los viajes" }];
    if (tripsData?.trips) {
      const tripOptionsFromData = tripsData.trips.map((trip) => ({
        value: trip.id.toString(),
        label: trip.title,
      }));
      options.push(...tripOptionsFromData);
    }
    return options;
  }, [tripsData]);

  // Opciones para el filtro de choferes
  const driverOptions = useMemo(() => {
    const options = [{ value: "", label: "Todos los choferes" }];
    if (usersData?.users) {
      // Filtrar solo usuarios con rol DRIVER
      const drivers = usersData.users.filter((user) => user.role === "DRIVER");
      const driverOptionsFromData = drivers.map((driver) => ({
        value: driver.id.toString(),
        label: driver.name,
      }));
      options.push(...driverOptionsFromData);
    }
    return options;
  }, [usersData]);

  const handleFilterChange = (
    key: keyof ExpenseFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 1, // Reset page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
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
    if (filters.type) count++;
    if (filters.tripId) count++;
    if (filters.driverId) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, [filters.type, filters.tripId, filters.driverId, filters.startDate, filters.endDate]);

  const getTypeBadge = (type?: string) => {
    if (!type) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Sin categoría
        </span>
      );
    }
    const typeConfig = {
      FUEL: { color: "bg-red-100 text-red-800", label: "Combustible" },
      TOLL: { color: "bg-yellow-100 text-yellow-800", label: "Peajes" },
      FOOD: { color: "bg-green-100 text-green-800", label: "Comida" },
      REPAIR: { color: "bg-blue-100 text-blue-800", label: "Reparación" },
      OTHER: { color: "bg-gray-100 text-gray-800", label: "Otro" },
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          config?.color || "bg-gray-100 text-gray-800"
        }`}
      >
        {config?.label || type}
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
    <div className="space-y-4 md:space-y-6">
      {/* Header Mobile First */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="md:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Gastos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los gastos registrados en el sistema.
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
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
              />
            </svg>
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Botón nuevo gasto */}
          {canCreateExpense && (
            <Link href="/expenses/new">
              <Button size="sm">Nuevo Gasto</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros colapsables */}
      {showFilters && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Filtrar gastos
            </h3>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            <Select
              label="Tipo"
              options={typeOptions}
              value={filters.type || ""}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            />
            <Select
              label="Viaje"
              options={tripOptions}
              value={filters.tripId || ""}
              onChange={(e) => handleFilterChange("tripId", e.target.value)}
            />
            <Select
              label="Chofer"
              options={driverOptions}
              value={filters.driverId || ""}
              onChange={(e) => handleFilterChange("driverId", e.target.value)}
            />
            <Input
              label="Fecha desde"
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <Input
              label="Fecha hasta"
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Lista de gastos */}
      {filteredExpenses && filteredExpenses.length > 0 ? (
        <div className="space-y-4 md:space-y-0 md:bg-white md:shadow md:overflow-hidden md:rounded-md">
          {/* Vista móvil: Cards individuales */}
          <div className="md:hidden space-y-4">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <div className="space-y-3">
                  {/* Header del card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-lg">
                            $
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {expense.description}
                        </h3>
                        <div className="mt-1">{getTypeBadge(expense.type)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(safeNumber(expense.amount))}
                      </div>
                    </div>
                  </div>

                  {/* Detalles del gasto */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">Fecha:</span>
                      <span className="ml-2">{formatDate(expense.date)}</span>
                    </div>
                    {expense.user && (
                      <div className="flex items-center">
                        <span className="font-medium">Usuario:</span>
                        <span className="ml-2">{expense.user.name}</span>
                      </div>
                    )}
                    {expense.trip && (
                      <div className="flex items-center">
                        <span className="font-medium">Viaje:</span>
                        <Link
                          href={`/trips/${expense.trip.id}`}
                          className="ml-2 text-blue-600 hover:text-blue-800 truncate"
                        >
                          {expense.trip.title}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Footer del card - Acciones */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      {expense.receiptUrl && (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Recibo
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {canEditExpense(expense) && (
                        <Link
                          href={`/expenses/${expense.id}/edit`}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          <Button variant="ghost" size="sm">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Editar
                          </Button>
                        </Link>
                      )}
                      {canDeleteExpense() && (
                        <DeleteExpenseButton
                          expense={expense}
                          buttonSize="sm"
                          buttonVariant="ghost"
                          showIcon={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop: Lista tradicional */}
          <ul className="hidden md:block divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <li key={expense.id} className="px-4 py-4 lg:px-6">
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
                        <div className="ml-2">{getTypeBadge(expense.type)}</div>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-500">
                          {formatDate(expense.date)}
                          {expense.user && ` • ${expense.user.name}`}
                          {expense.trip && (
                            <>
                              {" • "}
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
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    )}
                    {canEditExpense(expense) && (
                      <Link
                        href={`/expenses/${expense.id}/edit`}
                        className="text-gray-500 hover:text-gray-700 text-xs"
                      >
                        Editar
                      </Link>
                    )}
                    {canDeleteExpense() && (
                      <DeleteExpenseButton
                        expense={expense}
                        buttonSize="sm"
                        buttonVariant="ghost"
                        showIcon={true}
                      />
                    )}
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
                    Mostrando{" "}
                    <span className="font-medium">
                      {(filters.page! - 1) * filters.limit! + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-medium">
                      {Math.min(filters.page! * filters.limit!, data.total)}
                    </span>{" "}
                    de <span className="font-medium">{data.total}</span>{" "}
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
                            ? "bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
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
          <div className="bg-blue-50 p-4 md:px-6 md:py-3 border-t border-gray-200">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
              <p className="text-sm text-blue-700 font-medium">
                Total de gastos mostrados:
              </p>
              <p className="text-lg font-bold text-blue-900 md:text-xl">
                {filteredExpenses
                  ? formatExpensesTotal(filteredExpenses, true)
                  : "$0.00"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay gastos
          </h3>
          <p className="text-gray-500 mb-6">
            {isDriverUser
              ? "No tienes gastos registrados."
              : "Comienza registrando tu primer gasto."}
          </p>
          {canCreateExpense && (
            <Link href="/expenses/new">
              <Button>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Registrar Gasto
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
