'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useTripWithExpenses } from '@/hooks/useTrips';
import { TripForm } from '@/components/trips/TripForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EditTripPage() {
  const params = useParams();
  const tripId = params.id as string;

  const { data: trip, isLoading, error } = useTripWithExpenses(tripId);

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
      </div>
    );
  }

  return (
    <TripForm 
      mode="edit" 
      initialData={trip} 
    />
  );
}
