'use client';

import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { createExpiredToken, createSoonToExpireToken } from '@/lib/test-tokens';

export function TokenTestComponent() {
  const { token } = useAuthStore();

  const simulateExpiredToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', createExpiredToken());
      window.location.reload();
    }
  };

  const simulateSoonToExpireToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', createSoonToExpireToken());
      window.location.reload();
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg border border-yellow-300 space-y-2">
      <p className="text-sm text-yellow-800 mb-2">
        🧪 Herramientas de desarrollo
      </p>
      <div className="space-y-2">
        <Button
          onClick={simulateExpiredToken}
          variant="secondary"
          size="sm"
          className="w-full text-xs text-yellow-800"
        >
          Simular token expirado
        </Button>
        <Button
          onClick={simulateSoonToExpireToken}
          variant="secondary"
          size="sm"
          className="w-full text-xs text-yellow-800"
        >
          Simular token que expira pronto
        </Button>
      </div>
    </div>
  );
}
