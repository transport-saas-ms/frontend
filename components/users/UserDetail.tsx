'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, useChangePassword } from '@/hooks/useUsers';
import { UserRole } from '@/lib/types/index';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DeleteUserButton } from '@/components/users/DeleteUserButton';
import { ValidationErrors } from '@/components/ui/ValidationErrors';
import { useAuthStore } from '@/store/auth';

interface UserDetailProps {
  userId: string;
}

export const UserDetail: React.FC<UserDetailProps> = ({ userId }) => {
  const { data: user, isLoading, error } = useUser(userId);
  const changePassword = useChangePassword();
  const currentUser = useAuthStore((state) => state.user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    currentPassword: '', // Para cambio propio
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Determinar si el usuario está cambiando su propia contraseña
  const isOwnPassword = currentUser?.id === userId;

  // Validación de política de contraseña según la guía del backend
  const validatePasswordPolicy = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    
    if (password.length > 128) {
      errors.push('Máximo 128 caracteres');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una letra minúscula');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una letra mayúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Al menos un número');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Al menos un carácter especial');
    }
    
    if (/\s/.test(password)) {
      errors.push('No puede contener espacios');
    }
    
    return errors;
  };

  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string } => {
    const errors = validatePasswordPolicy(password);
    
    if (errors.length > 3) return { strength: 'weak', color: 'text-red-600' };
    if (errors.length > 0) return { strength: 'medium', color: 'text-yellow-600' };
    return { strength: 'strong', color: 'text-green-600' };
  };

  const getRoleInfo = (role: UserRole) => {
    const roleConfig = {
      ADMIN: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Administrador',
        description: 'Control total del sistema y gestión de usuarios'
      },
      ACCOUNTANT: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        label: 'Contador',
        description: 'Gestión de gastos, reportes y contabilidad'
      },
      DRIVER: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Conductor',
        description: 'Registro de viajes y gastos de transporte'
      },
      USER: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        label: 'Usuario',
        description: 'Acceso básico de lectura al sistema'
      },
    };
    
    // Protección contra roles desconocidos
    return roleConfig[role] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: role || 'Desconocido',
      description: 'Rol no reconocido'
    };
  };

  const validatePassword = (): boolean => {
    const errors: string[] = [];
    
    // Validar contraseña actual si es cambio propio
    if (isOwnPassword && !passwordData.currentPassword) {
      errors.push('La contraseña actual es obligatoria');
    }
    
    if (!passwordData.newPassword) {
      errors.push('La nueva contraseña es obligatoria');
    } else {
      // Usar validación de política del backend
      const policyErrors = validatePasswordPolicy(passwordData.newPassword);
      errors.push(...policyErrors);
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword() || !user) return;
    
    try {
      await changePassword.mutateAsync({
        userId: user.id, // Siempre incluir el userId
        newPassword: passwordData.newPassword,
        currentPassword: isOwnPassword ? passwordData.currentPassword : undefined,
        isOwnPassword: isOwnPassword,
      });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '', currentPassword: '' });
      setPasswordErrors([]);
    } catch {
      // El error ya se maneja en el hook con React Query
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ newPassword: '', confirmPassword: '', currentPassword: '' });
    setPasswordErrors([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    // Cerrar modal si estaba abierto
    if (showPasswordModal) {
      setShowPasswordModal(false);
    }
    
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Usuario no encontrado</h3>
        <p className="text-gray-500 mb-4">
          El usuario que buscas no existe o no tienes permisos para verlo.
        </p>
        <Link href="/users">
          <Button variant="secondary">Volver a usuarios</Button>
        </Link>
      </div>
    );
  }

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Mobile First */}
      <div className="space-y-4">
        {/* Back button y título */}
        <div className="flex items-center space-x-3">
          <Link href="/users">
            <Button variant="ghost" size="sm" className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 truncate md:text-2xl">
              {user.name}
            </h1>
            <p className="text-sm text-gray-500 truncate md:text-base">
              {user.email}
            </p>
          </div>
        </div>

        {/* Role badge prominente en móvil */}
        <div className="flex justify-center md:hidden">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 md:justify-center">
          <Link href={`/users/${user.id}/edit`} className="flex-1 sm:flex-none">
            <Button variant="secondary" className="w-full sm:w-auto">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            onClick={() => setShowPasswordModal(true)}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cambiar contraseña
          </Button>
          <div className="flex-1 sm:flex-none">
            <DeleteUserButton 
              user={user}
              buttonText="Eliminar"
            />
          </div>
        </div>
      </div>

      {/* Información del usuario - Mobile First */}
      <div className="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        {/* Información básica */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información básica</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 md:bg-transparent md:p-0">
              <div className="text-sm font-medium text-gray-500 mb-1">Nombre completo</div>
              <div className="text-base text-gray-900 font-medium md:font-normal">{user.name}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 md:border-0 md:bg-transparent md:p-0">
              <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
              <div className="text-base text-gray-900 font-medium md:font-normal break-all">{user.email}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 md:bg-transparent md:p-0">
              <div className="text-sm font-medium text-gray-500 mb-1">Compañía</div>
              <div className="text-base text-gray-900 font-medium md:font-normal">{user.company?.name || 'No disponible'}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 md:border-0 md:bg-transparent md:p-0">
              <div className="text-sm font-medium text-gray-500 mb-1">Fecha de registro</div>
              <div className="text-base text-gray-900 font-medium md:font-normal">
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'No disponible'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Rol y permisos */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rol y permisos</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm font-medium text-gray-500 mb-2">Rol actual</div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
                <div className="hidden md:block">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Activo
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 md:border-0 md:bg-transparent md:p-0">
              <div className="text-sm font-medium text-gray-500 mb-1">Descripción</div>
              <div className="text-sm text-gray-600">{roleInfo.description}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 md:hidden">
              <div className="text-sm font-medium text-gray-500 mb-1">Estado</div>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Activo
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-500">Estado</div>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña - Mobile First */}
      <Modal 
        isOpen={showPasswordModal} 
        onClose={closePasswordModal}
      >
        <div className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 md:text-xl">Cambiar contraseña</h3>
              <p className="text-sm text-gray-600 mt-2">
                {isOwnPassword 
                  ? `Cambiar tu contraseña` 
                  : `Establece una nueva contraseña para ${user?.name || 'el usuario'}`
                }
              </p>
            </div>
            
            {/* Campo de contraseña actual solo para cambios propios */}
            {isOwnPassword && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <Input
                  label="Contraseña actual"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Tu contraseña actual"
                  disabled={changePassword.isPending}
                />
              </div>
            )}
            
            <div>
              <Input
                label="Nueva contraseña"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Mín. 8 caracteres con mayúscula, número y símbolo"
                disabled={changePassword.isPending}
              />
            </div>
            
            {/* Indicador de fuerza de contraseña - Mobile optimized */}
            {passwordData.newPassword && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fuerza de contraseña:</span>
                  <span className={`text-sm font-bold ${getPasswordStrength(passwordData.newPassword).color}`}>
                    {getPasswordStrength(passwordData.newPassword).strength === 'weak' && '🔴 Débil'}
                    {getPasswordStrength(passwordData.newPassword).strength === 'medium' && '🟡 Media'}
                    {getPasswordStrength(passwordData.newPassword).strength === 'strong' && '🟢 Fuerte'}
                  </span>
                </div>
                
                {/* Requisitos de contraseña */}
                <div className="space-y-1">
                  {validatePasswordPolicy(passwordData.newPassword).length > 0 ? (
                    <div className="text-xs space-y-1">
                      <div className="font-medium text-gray-700 mb-2">Requisitos pendientes:</div>
                      {validatePasswordPolicy(passwordData.newPassword).map((error, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-red-500 text-xs">✗</span>
                          <span className="text-red-600">{error}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <span className="text-sm">✓</span>
                      <span className="text-sm font-medium">Cumple con todos los requisitos</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <Input
                label="Confirmar nueva contraseña"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repite la nueva contraseña"
                disabled={changePassword.isPending}
              />
            </div>
            
            <ValidationErrors errors={passwordErrors} />
            
            {/* Botones de acción - Mobile First */}
            <div className="pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  onClick={handleChangePassword}
                  loading={changePassword.isPending}
                  disabled={changePassword.isPending}
                  className="w-full sm:flex-1 order-2 sm:order-1"
                >
                  {isOwnPassword ? 'Cambiar mi contraseña' : 'Cambiar contraseña'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={closePasswordModal}
                  disabled={changePassword.isPending}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
