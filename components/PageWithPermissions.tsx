'use client';

import React from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ForbiddenError } from '@/components/ForbiddenError';

interface PageWithPermissionsProps {
  children: React.ReactNode;
  requiredCapabilities?: string[];
  requiredRoles?: string[];
  requireAll?: boolean;
  forbiddenMessage?: string;
  onRetry?: () => void;
}

export const PageWithPermissions: React.FC<PageWithPermissionsProps> = ({
  children,
  requiredCapabilities = [],
  requiredRoles = [],
  requireAll = false,
  forbiddenMessage = 'No tienes permisos para acceder a esta página',
  onRetry,
}) => {
  return (
    <PermissionGuard
      capabilities={requiredCapabilities}
      roles={requiredRoles}
      requireAll={requireAll}
      fallback={
        <ForbiddenError 
          message={forbiddenMessage}
          onRetry={onRetry}
        />
      }
    >
      {children}
    </PermissionGuard>
  );
};
