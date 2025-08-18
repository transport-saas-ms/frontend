import { PageWithPermissions } from '@/components/PageWithPermissions';
import { UserForm } from '@/components/users/UserForm';
import { ROLES } from '@/lib/permissions';

export default function CreateUserPage() {
  return (
    <PageWithPermissions
      requiredRoles={[ROLES.ADMIN]}
      forbiddenMessage="Solo los administradores pueden crear usuarios."
    >
      <div className="space-y-4 md:space-y-6">
        {/* Formulario Mobile First */}
        <div className="md:bg-white md:shadow-sm md:rounded-lg md:p-6">
          <UserForm mode="create" />
        </div>

        {/* Información adicional Mobile First */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Información importante
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>El usuario será asignado automáticamente a tu compañía</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Podrás cambiar su rol en cualquier momento desde su perfil</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Los permisos se aplicarán inmediatamente según el rol asignado</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageWithPermissions>
  );
}
