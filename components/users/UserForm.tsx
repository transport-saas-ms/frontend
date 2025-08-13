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
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Campos de contraseña */}
        {mode === 'create' && (
          <>
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
          </>
        )}

        {mode === 'edit' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              💡 Para cambiar la contraseña, usa la opción &quot;Cambiar contraseña&quot; en los detalles del usuario.
            </p>
          </div>
        )}

        {/* Mostrar errores de validación */}
        <ValidationErrors errors={Object.values(errors).filter(Boolean)} />

        <div className="flex space-x-4">
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            {mode === 'create' ? 'Crear usuario' : 'Actualizar usuario'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
