import React from 'react';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { UserDetail } from '@/components/users/UserDetail';
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
        {/* Componente de detalle */}
        <UserDetail userId={resolvedParams.id} />
      </div>
    </PageWithPermissions>
  );
}
