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

interface UserDetailProps {
  userId: string;
}

export const UserDetail: React.FC<UserDetailProps> = ({ userId }) => {
  const { data: user, isLoading, error } = useUser(userId);
  const changePassword = useChangePassword();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

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
    
    if (!passwordData.newPassword) {
      errors.push('La nueva contraseña es obligatoria');
    } else if (passwordData.newPassword.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
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
        userId: user.id,
        newPassword: passwordData.newPassword,
      });
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setPasswordErrors([]);
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con acciones */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/users/${user.id}/edit`}>
              <Button variant="secondary">
                ✏️ Editar
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              onClick={() => setShowPasswordModal(true)}
            >
              🔒 Cambiar contraseña
            </Button>
            <DeleteUserButton 
              user={user}
              buttonText="Eliminar usuario"
            />
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Información básica</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Compañía</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.company?.name || 'No disponible'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'No disponible'
                }
              </dd>
            </div>
          </dl>
        </div>

        {/* Rol y permisos */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rol y permisos</h2>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">Rol actual</dt>
              <dd>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1 text-sm text-gray-600">{roleInfo.description}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Estado</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Activo
                </span>
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      <Modal 
        isOpen={showPasswordModal} 
        onClose={closePasswordModal}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Cambiar contraseña</h3>
          <p className="text-sm text-gray-600">
            Establece una nueva contraseña para <strong>{user?.name || 'el usuario'}</strong>
          </p>
          
          <Input
            label="Nueva contraseña"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Mínimo 8 caracteres"
            disabled={changePassword.isPending}
          />
          
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Repite la nueva contraseña"
            disabled={changePassword.isPending}
          />
          
          <ValidationErrors errors={passwordErrors} />
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleChangePassword}
              loading={changePassword.isPending}
              disabled={changePassword.isPending}
              className="flex-1"
            >
              Cambiar contraseña
            </Button>
            <Button
              variant="secondary"
              onClick={closePasswordModal}
              disabled={changePassword.isPending}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
