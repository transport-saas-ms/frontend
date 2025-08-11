'use client';

import React from 'react';
import { Select } from '@/components/ui/Select';
import { UserRole } from '@/lib/types/index';

interface UserRoleSelectProps {
  value: UserRole | '';
  onChange: (value: UserRole | '') => void;
  disabled?: boolean;
  includeEmpty?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const UserRoleSelect: React.FC<UserRoleSelectProps> = ({
  value,
  onChange,
  disabled = false,
  includeEmpty = true,
  placeholder = 'Seleccionar rol',
  label,
  error,
}) => {
  const roleOptions = [
    ...(includeEmpty ? [{ value: '', label: placeholder }] : []),
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'ACCOUNTANT', label: 'Contador' },
    { value: 'DRIVER', label: 'Conductor' },
    { value: 'USER', label: 'Usuario' },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as UserRole | '');
  };

  const getRoleColor = (role: string) => {
    const colors = {
      ADMIN: 'text-red-600',
      ACCOUNTANT: 'text-blue-600',
      DRIVER: 'text-green-600',
      USER: 'text-gray-600',
    };
    return colors[role as keyof typeof colors] || 'text-gray-600';
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      ADMIN: 'Control total del sistema',
      ACCOUNTANT: 'Gestión de gastos y reportes',
      DRIVER: 'Registro de viajes y gastos',
      USER: 'Acceso básico de lectura',
    };
    return descriptions[role as keyof typeof descriptions];
  };

  return (
    <div>
      <Select
        value={value}
        onChange={handleChange}
        options={roleOptions}
        disabled={disabled}
        label={label}
        error={error}
      />
      {value && (
        <p className={`mt-1 text-xs ${getRoleColor(value)}`}>
          {getRoleDescription(value)}
        </p>
      )}
    </div>
  );
};
