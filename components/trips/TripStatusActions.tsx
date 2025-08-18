'use client';

import React from 'react';
import { Trip } from '@/lib/types/index';
import { Button } from '@/components/ui/Button';
import { useTripStatusActions } from '@/hooks/useTrips';

interface TripStatusActionsProps {
  trip: Trip;
  buttonSize?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const TripStatusActions: React.FC<TripStatusActionsProps> = ({
  trip,
  buttonSize = 'md',
  showLabels = true,
}) => {
  const { startTrip, completeTrip, isStarting, isCompleting } = useTripStatusActions(trip.id);

  const handleStartTrip = () => {
    startTrip.mutate();
  };

  const handleCompleteTrip = () => {
    completeTrip.mutate();
  };

  // No mostrar botones si el viaje ya está completado
  if (trip.status === 'COMPLETED') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500 italic">
          Completado
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Botón Iniciar Viaje - Solo si está pendiente */}
      {trip.status === 'PENDING' && (
        <Button
          variant="primary"
          size={buttonSize}
          onClick={handleStartTrip}
          loading={isStarting}
          disabled={isCompleting}
          title="Iniciar viaje"
        >
          <svg
            className={`${buttonSize === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${showLabels ? 'mr-2' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
          {showLabels && 'Iniciar Viaje'}
        </Button>
      )}

      {/* Botón Completar Viaje - Solo si está en progreso */}
      {trip.status === 'IN_PROGRESS' && (
        <Button
          variant="secondary"
          size={buttonSize}
          onClick={handleCompleteTrip}
          loading={isCompleting}
          disabled={isStarting}
          title="Completar viaje"
        >
          <svg
            className={`${buttonSize === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${showLabels ? 'mr-2' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {showLabels && 'Completar Viaje'}
        </Button>
      )}
    </div>
  );
};
