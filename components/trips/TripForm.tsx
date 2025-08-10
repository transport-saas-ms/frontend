'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTrip } from '@/hooks/useTrips';
import { useCompanyUsers } from '@/hooks/useCompany';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export const TripForm: React.FC = () => {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const user = useAuthStore((state) => state.user);
  
  // Obtener usuarios/conductores de la empresa
  const { data: companyUsers, isLoading: isLoadingUsers } = useCompanyUsers(user?.companyId || '');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    origin: '',
    destination: '',
    scheduledDate: '',
    driverId: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚗 Current user:', user);
    console.log('🚗 User companyId:', user?.companyId);
    
    // Validación básica
    if (!formData.title || !formData.origin || !formData.destination || !formData.scheduledDate || !formData.driverId) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    // Validar que el usuario tenga companyId
    if (!user?.companyId) {
      alert('Error: No se puede determinar la empresa del usuario');
      return;
    }

    const submitData = {
      title: formData.title,
      description: formData.description || undefined,
      origin: formData.origin,
      destination: formData.destination,
      scheduledDate: `${formData.scheduledDate}T09:00`, // Agregar hora por defecto (9:00 AM)
      driverId: formData.driverId,
      companyId: user.companyId,
    };

    console.log('🚗 Submit data:', submitData);
    createTrip.mutate(submitData);
  };

  // Filtrar solo conductores (DRIVER) de la lista de usuarios
  const drivers = companyUsers?.filter(user => user.role === 'DRIVER' && user.id) || [];
  
  const driverOptions = [
    { 
      value: '', 
      label: isLoadingUsers 
        ? 'Cargando conductores...' 
        : drivers.length === 0 
          ? 'No hay conductores disponibles' 
          : 'Seleccione un conductor' 
    },
    ...drivers.map(driver => ({
      value: driver.id,
      label: `${driver.name} (${driver.email})`,
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Crear Nuevo Viaje
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Complete los datos para crear un nuevo viaje.
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
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
                label="Título del Viaje *"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="Ej: Viaje a Buenos Aires"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Descripción"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción del viaje (opcional)"
              />
            </div>

            <Input
              label="Origen *"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              required
              placeholder="Ciudad de origen"
            />

            <Input
              label="Destino *"
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
              required
              placeholder="Ciudad de destino"
            />

            <Input
              label="Fecha Programada *"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              required
            />

            <Select
              label="Conductor *"
              options={driverOptions}
              value={formData.driverId}
              onChange={(e) => handleInputChange('driverId', e.target.value)}
              required
              disabled={isLoadingUsers}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createTrip.isPending}
            >
              Crear Viaje
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
