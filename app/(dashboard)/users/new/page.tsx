import Link from 'next/link';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { UserForm } from '@/components/users/UserForm';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/lib/permissions';

export default function CreateUserPage() {
  return (
    <PageWithPermissions
      requiredRoles={[ROLES.ADMIN]}
      forbiddenMessage="Solo los administradores pueden crear usuarios."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear nuevo usuario</h1>
            <p className="mt-2 text-gray-600">
              Agrega un nuevo miembro a tu compañía y asigna su rol en el sistema.
            </p>
          </div>
          <Link href="/users">
            <Button variant="secondary">
              ← Volver a usuarios
            </Button>
          </Link>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <UserForm mode="create" />
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Información importante</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• El usuario será asignado automáticamente a tu compañía</li>
            {/* <li>• Recibirá un email con sus credenciales de acceso</li> */}
            <li>• Podrás cambiar su rol en cualquier momento desde su perfil</li>
            <li>• Los permisos se aplicarán inmediatamente según el rol asignado</li>
          </ul>
        </div>
      </div>
    </PageWithPermissions>
  );
}
