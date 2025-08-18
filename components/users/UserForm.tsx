'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { User, CreateUserData, UpdateUserData, UserRole } from '@/lib/types/index';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserRoleSelect } from '@/components/users/UserRoleSelect';
import { ValidationErrors } from '@/components/ui/ValidationErrors';

interface UserFormProps {
  mode?: 'create' | 'edit';
  initialData?: User;
}

export const UserForm: React.FC<UserFormProps> = ({ 
  mode = 'create', 
  initialData 
}) => {
  const router = useRouter();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(initialData?.id || '');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar datos del formulario en modo edición
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        confirmPassword: '',
        role: initialData.role || '',
      });
    }
  }, [mode, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Validar contraseña (solo en modo crear o si se está cambiando)
    if (mode === 'create' || formData.password) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      // Validar confirmación de contraseña
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    // Validar rol
    if (!formData.role) {
      newErrors.role = 'El rol es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        const userData: CreateUserData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role as UserRole,
        };
        await createUser.mutateAsync(userData);
      } else {
        const userData: UpdateUserData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role as UserRole,
        };
        await updateUser.mutateAsync(userData);
        router.push(`/users/${initialData?.id}`);
      }
    } catch {
      // El error ya se maneja en el hook con React Query
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isLoading = mode === 'create' ? createUser.isPending : updateUser.isPending;

  return (
    <div className="space-y-6">
      {/* Header Mobile First */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="p-2"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
            {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
          </h1>
          <p className="text-sm text-gray-600">
            {mode === 'create' 
              ? 'Completa la información para crear un nuevo usuario' 
              : 'Modifica la información del usuario'
            }
          </p>
        </div>
      </div>

      {/* Formulario Mobile First */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:shadow-sm md:p-6 md:max-w-2xl md:mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 md:space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información básica
              </h2>
              
              <div>
                <Input
                  label="Nombre completo"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Ej: Juan Pérez"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="usuario@ejemplo.com"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <UserRoleSelect
                  label="Rol"
                  value={formData.role}
                  onChange={(value) => handleInputChange('role', value)}
                  error={errors.role}
                  includeEmpty={false}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campos de contraseña */}
            {mode === 'create' && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Contraseña
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Requisitos de contraseña:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Mínimo 8 caracteres</li>
                        <li>• Al menos una mayúscula y una minúscula</li>
                        <li>• Al menos un número</li>
                        <li>• Al menos un carácter especial</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <Input
                    label="Contraseña"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={errors.password}
                    placeholder="Mínimo 8 caracteres"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    placeholder="Repite la contraseña"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            )}

            {/* Información sobre cambio de contraseña en modo edición */}
            {mode === 'edit' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Cambio de contraseña
                    </p>
                    <p className="text-sm text-blue-700">
                      Para cambiar la contraseña, ve a los detalles del usuario y usa la opción &quot;Cambiar contraseña&quot;.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mostrar errores de validación */}
          <ValidationErrors errors={Object.values(errors).filter(Boolean)} />

          {/* Botones de acción - Mobile First */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full sm:flex-1 order-2 sm:order-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {mode === 'create' ? 'Crear usuario' : 'Actualizar usuario'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isLoading}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
