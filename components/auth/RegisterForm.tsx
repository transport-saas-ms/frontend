'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRegister } from '@/hooks/useAuth';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { RegisterData } from '@/lib/types/index';

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ValidationErrors } from '@/components/ui/ValidationErrors';

export const RegisterForm: React.FC = () => {
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [generalValidationErrors, setGeneralValidationErrors] = useState<string[]>([]);
  const { getValidationErrors, isWeakPasswordError } = useErrorHandler();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterFormData>();

  const registerMutation = useRegister();
  const password = watch('password');

  // Limpiar errores del servidor cuando el usuario modifica el campo
  useEffect(() => {
    if (password && serverErrors.password) {
      setServerErrors(prev => ({ ...prev, password: '' }));
      clearErrors('password');
    }
  }, [password, serverErrors.password, clearErrors]);

  const onSubmit = (data: RegisterFormData) => {
    // Limpiar errores previos del servidor
    setServerErrors({});
    setGeneralValidationErrors([]);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...registerData } = data;
    
    // Por defecto, todos los nuevos usuarios empiezan como USER
    registerMutation.mutate(
      { ...registerData, role: 'USER' },
      {
        onError: (error) => {
          // Capturar errores de validación del servidor
          const validationErrors = getValidationErrors(error);
          
          if (validationErrors.length > 0) {
            // Manejar errores específicos de contraseña
            if (isWeakPasswordError(error)) {
              const passwordError = validationErrors.find(err => 
                err.toLowerCase().includes('password')
              );
              if (passwordError) {
                setError('password', {
                  type: 'server',
                  message: passwordError,
                });
                setServerErrors(prev => ({ ...prev, password: passwordError }));
              }
            }
            
            // Si hay múltiples errores o errores no específicos, mostrarlos en el componente general
            const nonPasswordErrors = validationErrors.filter(err => 
              !err.toLowerCase().includes('password')
            );
            
            if (nonPasswordErrors.length > 0) {
              setGeneralValidationErrors(nonPasswordErrors);
            }
          }
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-xl text-gray-600">
            Únete a Transport SaaS
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Tu cuenta será creada con permisos de usuario básico
          </p>
        </div>
        
        {/* Mostrar errores de validación generales del servidor */}
        {generalValidationErrors.length > 0 && (
          <ValidationErrors 
            errors={generalValidationErrors}
            title="Error en el registro:"
          />
        )}
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
              helperText={
                !errors.password?.message 
                  ? "La contraseña debe tener al menos 6 caracteres"
                  : undefined
              }
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
