import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import { AdminDashboardGraphiques } from '../../../components/admin/dashboard';

/**
 * Page d'accueil du panneau d'administration.
 * Affiche les indicateurs clés, les ventes, les opérations à traiter et les utilisateurs.
 */
export default function TableauDeBordAdmin() {
  return (
    <DispositionAdmin>
      <AdminDashboardGraphiques />
    </DispositionAdmin>
  );
}
