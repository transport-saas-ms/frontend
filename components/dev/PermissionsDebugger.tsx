'use client';

import React, { useState } from 'react';
import { usePermissions } from '@/hooks/useAuthMe';
import { useAuthStore } from '@/store/auth';
import { CAPABILITIES, CAPABILITY_GROUPS } from '@/lib/permissions';

export const PermissionsDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { permissions, isAdmin, isAccountant, isDriver, shouldHaveAccess } = usePermissions();
  const user = useAuthStore((state) => state.user);

  if (process.env.NODE_ENV === 'production') {
    return null; // No mostrar en producción
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-purple-700"
      >
        🔍 Debug Permisos
      </button>
      
      {isVisible && (
        <div className="absolute text-black bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Usuario Actual</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Nombre:</span> {user?.name}</p>
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Rol:</span> {user?.role}</p>
                <p><span className="font-medium">Company ID:</span> {user?.companyId}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Roles Detectados</h3>
              <div className="text-sm space-y-1">
                <p className={isAdmin ? 'text-green-600' : 'text-gray-400'}>
                  • ADMIN: {isAdmin ? '✅' : '❌'}
                </p>
                <p className={isAccountant ? 'text-green-600' : 'text-gray-400'}>
                  • ACCOUNTANT: {isAccountant ? '✅' : '❌'}
                </p>
                <p className={isDriver ? 'text-green-600' : 'text-gray-400'}>
                  • DRIVER: {isDriver ? '✅' : '❌'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Permisos del Servidor</h3>
              <div className="text-sm">
                <p><span className="font-medium">Rol:</span> {permissions?.role || 'N/A'}</p>
                <div className="mt-2">
                  <p className="font-medium">Capabilities:</p>
                  {permissions?.capabilities && permissions.capabilities.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600 ml-2">
                      {permissions.capabilities.map((cap, index) => (
                        <li key={index}>{cap}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">Sin capabilities asignadas</p>
                  )}
                </div>
                
                {permissions?.restrictions && permissions.restrictions.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Restricciones:</p>
                    <ul className="list-disc list-inside text-red-600 ml-2">
                      {permissions.restrictions.map((restriction, index) => (
                        <li key={index}>{restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Test de Permisos</h3>
              <div className="text-sm space-y-1">
                <p>VIEW_ALL_TRIPS: {permissions?.capabilities?.includes(CAPABILITIES.VIEW_ALL_TRIPS) ? '✅' : '❌'}</p>
                <p>MANAGE_EXPENSES: {permissions?.capabilities?.includes(CAPABILITIES.MANAGE_EXPENSES) ? '✅' : '❌'}</p>
                <p>CREATE_TRIP: {permissions?.capabilities?.includes(CAPABILITIES.CREATE_TRIP) ? '✅' : '❌'}</p>
                <p>MANAGE_TRIP: {permissions?.capabilities?.includes(CAPABILITIES.MANAGE_TRIP) ? '✅' : '❌'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Debería Tener Acceso</h3>
              <div className="text-sm space-y-1">
                <p>Trips (cualquier capability): {shouldHaveAccess([...CAPABILITY_GROUPS.TRIPS], ['ADMIN']) ? '✅' : '❌'}</p>
                <p>Expenses (cualquier capability): {shouldHaveAccess([...CAPABILITY_GROUPS.EXPENSES], ['ADMIN']) ? '✅' : '❌'}</p>
                <p>Como ADMIN: {shouldHaveAccess([], ['ADMIN']) ? '✅' : '❌'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
