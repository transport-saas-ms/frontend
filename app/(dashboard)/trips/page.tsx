import { TripsList } from '@/components/trips/TripsList';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { CAPABILITY_GROUPS } from '@/lib/permissions';

export default function TripsPage() {
  return (
    <PageWithPermissions
      requiredCapabilities={[...CAPABILITY_GROUPS.TRIPS]}
      requireAll={false} // Solo necesita UNO de los permisos
      forbiddenMessage="No tienes permisos para ver viajes. Contacta al administrador para que te asigne los permisos necesarios."
    >
      <TripsList />
    </PageWithPermissions>
  );
}
