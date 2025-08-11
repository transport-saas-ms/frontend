import { PageWithPermissions } from '@/components/PageWithPermissions';
import { UsersList } from '@/components/users/UsersList';
import { ROLES } from '@/lib/permissions';

export default function UsersPage() {
  return (
    <PageWithPermissions
      requiredRoles={[ROLES.ADMIN]}
      forbiddenMessage="Solo los administradores pueden gestionar usuarios. Contacta al administrador si necesitas acceso."
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h1>
          <p className="mt-2 text-gray-600">
            Administra los usuarios de tu compañía, asigna roles y controla el acceso al sistema.
          </p>
        </div>
        
        <UsersList />
      </div>
    </PageWithPermissions>
  );
}
