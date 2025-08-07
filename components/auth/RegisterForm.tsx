'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRegister } from '@/hooks/useAuth';
import { RegisterData } from '@/lib/types';

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const registerMutation = useRegister();
  const password = watch('password');

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  const roleOptions = [
    { value: 'USER', label: 'Usuario' },
    { value: 'DRIVER', label: 'Conductor' },
    { value: 'ACCOUNTANT', label: 'Contador' },
    { value: 'ADMIN', label: 'Administrador' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Únete a Transport SaaS
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              autoComplete="name"
              {...register('name', {
                required: 'El nombre es requerido',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres',
                },
              })}
              error={errors.name?.message}
            />

            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'El correo electrónico es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Ingresa un correo electrónico válido',
                },
              })}
              error={errors.email?.message}
            />

            <Select
              label="Rol"
              options={roleOptions}
              {...register('role', {
                required: 'El rol es requerido',
              })}
              error={errors.role?.message}
            />

            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (value: string) =>
                  value === password || 'Las contraseñas no coinciden',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={registerMutation.isPending}
            >
              Crear Cuenta
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
