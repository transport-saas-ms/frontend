'use client';

import React from 'react';
import { Trip } from '@/lib/types/index';
import { Select } from '@/components/ui/Select';
import { useTripStatusActions } from '@/hooks/useTrips';

interface TripStatusSelectProps {
  trip: Trip;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TripStatusSelect: React.FC<TripStatusSelectProps> = ({
  trip,
  size = 'md',
  showLabel = false,
}) => {
  const { startTrip, completeTrip, isStarting, isCompleting } = useTripStatusActions(trip.id);

  // Filtrar opciones según el estado actual
  const getAvailableOptions = () => {
    switch (trip.status) {
      case 'PENDING':
        return [
          { value: 'PENDING', label: '🟡 Pendiente' },
          { value: 'IN_PROGRESS', label: '🔵 Iniciar Viaje' },
        ];
      case 'IN_PROGRESS':
        return [
          { value: 'IN_PROGRESS', label: '🔵 En Progreso' },
          { value: 'COMPLETED', label: '🟢 Completar Viaje' },
        ];
      case 'COMPLETED':
        return [
          { value: 'COMPLETED', label: '🟢 Completado' },
        ];
      default:
        return [
          { value: trip.status, label: trip.status },
        ];
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    
    if (newStatus === 'IN_PROGRESS' && trip.status === 'PENDING') {
      startTrip.mutate();
    } else if (newStatus === 'COMPLETED' && trip.status === 'IN_PROGRESS') {
      completeTrip.mutate();
    }
    // No hacer nada si selecciona el mismo estado
  };

  const isLoading = isStarting || isCompleting;

  return (
    <div className={size === 'sm' ? 'min-w-[120px]' : 'min-w-[140px]'}>
      <Select
        label={showLabel ? 'Estado' : undefined}
        options={getAvailableOptions()}
        value={trip.status}
        onChange={handleStatusChange}
        disabled={isLoading || trip.status === 'COMPLETED'}
        className={`
          ${size === 'sm' ? 'text-xs' : 'text-sm'}
          ${isLoading ? 'opacity-50' : ''}
        `}
      />
      {isLoading && (
        <div className="text-xs text-gray-500 mt-1">
          {isStarting ? 'Iniciando...' : 'Completando...'}
        </div>
      )}
    </div>
  );
};
