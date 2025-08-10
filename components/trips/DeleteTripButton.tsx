'use client';

import React from 'react';
import { useDeleteTrip } from '@/hooks/useTrips';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Trip } from '@/lib/types';

interface DeleteTripButtonProps {
  trip: Trip;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  buttonText?: string;
  showIcon?: boolean;
  onDeleted?: () => void; // Callback opcional después de eliminar
}

export const DeleteTripButton: React.FC<DeleteTripButtonProps> = ({
  trip,
  buttonSize = 'sm',
  buttonVariant = 'danger',
  buttonText = 'Eliminar',
  showIcon = true,
  onDeleted,
}) => {
  const deleteTripMutation = useDeleteTrip();

  const handleDelete = async () => {
    await deleteTripMutation.mutateAsync(trip.id);
    onDeleted?.();
  };

  return (
    <DeleteButton
      onDelete={handleDelete}
      itemName={trip.title}
      itemType="viaje"
      buttonText={buttonText}
      buttonSize={buttonSize}
      buttonVariant={buttonVariant}
      showIcon={showIcon}
      successMessage={`Viaje "${trip.title}" eliminado correctamente`}
      errorMessage="Error al eliminar el viaje. Intenta de nuevo."
      confirmTitle="Eliminar viaje"
      confirmMessage={`¿Estás seguro de que deseas eliminar el viaje "${trip.title}"? Esta acción eliminará también todos los gastos asociados y no se puede deshacer.`}
    />
  );
};
