'use client';

import { useTokenValidation } from '@/hooks/useTokenValidation';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  // Inicializar la validación de tokens
  useTokenValidation();

  return <>{children}</>;
}
