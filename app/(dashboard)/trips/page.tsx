import { TripsList } from '@/components/trips/TripsList';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { CAPABILITY_GROUPS, ROLES } from '@/lib/permissions';

export default function TripsPage() {
  return (
    <PageWithPermissions
      requiredCapabilities={[...CAPABILITY_GROUPS.TRIPS]} // Usar capabilities del servidor
      requiredRoles={[ROLES.ADMIN, ROLES.ACCOUNTANT]} // ADMIN siempre tiene acceso
      requireAll={false} // Solo necesita UNO de los permisos/roles
      forbiddenMessage="No tienes permisos para ver viajes. Contacta al administrador para que te asigne los permisos necesarios."
    >
      <TripsList />
    </PageWithPermissions>
  );
}
