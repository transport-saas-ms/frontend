'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { useTrips, useTrip } from '@/hooks/useTrips';
import { useExpense } from '@/hooks/useExpenses';
import { Expense, ExpenseCategory, CreateExpenseData } from '@/lib/types/index';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/lib/utils';

interface ExpenseFormProps {
  mode?: 'create' | 'edit';
  expenseId?: string; // usado en edición
  initialData?: Expense; // opcional si ya viene cargado
  defaultTripId?: string; // para preseleccionar viaje
  onSuccessRedirect?: string; // ruta a redirigir tras éxito
}

// Map de categorías para labels human-friendly
const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'FUEL', label: 'Combustible' },
  { value: 'TOLL', label: 'Peaje' },
  { value: 'FOOD', label: 'Comida' },
  { value: 'REPAIR', label: 'Reparación' },
  { value: 'OTHER', label: 'Otro' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  mode = 'create',
  expenseId,
  initialData,
  defaultTripId,
  onSuccessRedirect = '/expenses',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripQueryParam = searchParams.get('tripId');

  // Edición: cargar gasto si no vino como initialData
  const { data: fetchedExpense, isLoading: isLoadingExpense } = useExpense(expenseId || '');

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense(expenseId || '');

  // Traer lista de viajes (simple: primeras 50 páginas 1 con limit 50) - se puede optimizar luego
  const { data: tripsData } = useTrips({ page: 1, limit: 50 });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'FUEL' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    tripId: defaultTripId || tripQueryParam || '',
    receiptUrl: '',
  });

  // Datos del viaje seleccionado para derivar driverId / companyId
  const { data: selectedTrip } = useTrip(formData.tripId || '');

  // Hidratar formulario en edición
  // Evitar re-hidrataciones múltiples que borren cambios del usuario
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (hydrated) return;
    const source = initialData || fetchedExpense;
    if (mode === 'edit' && source) {
      setFormData({
        description: source.description || '',
        amount: source.amount ? source.amount.toString() : '',
        type: (source.type as ExpenseCategory) || 'FUEL',
        date: source.date ? new Date(source.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        tripId: source.tripId || source.trip?.id || '',
        receiptUrl: source.receiptUrl || source.imageUrl || '',
      });
      setHydrated(true);
    }
  }, [mode, initialData, fetchedExpense, hydrated]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
  if (!formData.description.trim()) return 'La descripción es obligatoria';
  if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) return 'El monto debe ser un número mayor a 0';
  if (!formData.tripId) return 'Debe seleccionar un viaje';
  if (!formData.date) return 'La fecha es obligatoria';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      alert(error); // Mantener patrón simple (podrías cambiar a toast)
      return;
    }

    if (!selectedTrip) {
      alert('No se pudo obtener datos del viaje seleccionado (driver/company).');
      return;
    }

    const payload: CreateExpenseData = {
      description: formData.description.trim(),
      amount: Number(formData.amount),
      type: formData.type,
      date: `${formData.date}T12:00`,
      tripId: formData.tripId,
      driverId: selectedTrip.driverId,
      companyId: selectedTrip.companyId,
      receiptUrl: formData.receiptUrl || undefined,
    };

    if (mode === 'create') {
      createExpense.mutate(payload, {
        onSuccess: () => router.push(onSuccessRedirect),
      });
    } else if (mode === 'edit' && expenseId) {
      updateExpense.mutate(payload, {
        onSuccess: () => router.push(onSuccessRedirect),
      });
    }
  };

  const trips = tripsData?.trips || [];
  const tripOptions = [
    { value: '', label: trips.length === 0 ? 'No hay viajes disponibles' : 'Seleccione un viaje' },
    ...trips.map(t => ({ value: t.id, label: t.title }))
  ];

  const categoryOptions = [
    { value: '', label: 'Seleccione categoría' },
    ...CATEGORY_OPTIONS.map(c => ({ value: c.value, label: c.label }))
  ];

  const submitting = mode === 'create' ? createExpense.isPending : updateExpense.isPending;

  // Loading estado en edición
  if (mode === 'edit' && (isLoadingExpense || !fetchedExpense && !hydrated)) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-sm text-gray-500">Cargando gasto...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            {mode === 'create' ? 'Registrar Gasto' : 'Editar Gasto'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'create' ? 'Complete los datos para registrar un nuevo gasto.' : 'Modifique los datos del gasto.'}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Descripción *"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                placeholder="Ej: Combustible estación YPF"
              />
            </div>

            <Input
              label="Monto *"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
              placeholder="0.00"
            />

            <Input
              label="Fecha *"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />

            <Select
              label="Tipo *"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={categoryOptions}
              required
            />

            <Select
              label="Viaje *"
              value={formData.tripId}
              onChange={(e) => handleChange('tripId', e.target.value)}
              options={tripOptions}
              required
            />

            <Input
              label="URL Comprobante"
              value={formData.receiptUrl}
              onChange={(e) => handleChange('receiptUrl', e.target.value)}
              placeholder="https://..."
            />

            {/* Vista previa rápida monto */}
            {formData.amount && !isNaN(Number(formData.amount)) && (
              <div className="sm:col-span-2 text-sm text-gray-500">
                Monto formateado: <span className="font-medium">{formatCurrency(Number(formData.amount))}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Registrar Gasto' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
