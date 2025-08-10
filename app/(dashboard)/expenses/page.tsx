import { ExpensesList } from '@/components/expenses/ExpensesList';
import { PageWithPermissions } from '@/components/PageWithPermissions';
import { CAPABILITY_GROUPS, ROLES } from '@/lib/permissions';

export default function ExpensesPage() {
  return (
    <PageWithPermissions
      requiredCapabilities={[...CAPABILITY_GROUPS.EXPENSES]} // Usar capabilities del servidor
      requiredRoles={[ROLES.ADMIN]} // ADMIN siempre tiene acceso
      requireAll={false} // Solo necesita UNO de los permisos/roles
      forbiddenMessage="No tienes permisos para ver gastos. Contacta al administrador para que te asigne los permisos necesarios."
    >
      <ExpensesList />
    </PageWithPermissions>
  );
}
