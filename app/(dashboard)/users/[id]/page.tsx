import React from 'react';
import Link from 'next/link';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { UserDetail } from '@/components/users/UserDetail';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/lib/permissions';

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = React.use(params);
  
  return (
    <PageWithPermissions
      requiredRoles={[ROLES.ADMIN]}
      forbiddenMessage="Solo los administradores pueden ver detalles de usuarios."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/users">
              <Button variant="ghost" size="sm">
                ← Volver a usuarios
              </Button>
            </Link>
          </div>
        </div>

        {/* Componente de detalle */}
        <UserDetail userId={resolvedParams.id} />
      </div>
    </PageWithPermissions>
  );
}
