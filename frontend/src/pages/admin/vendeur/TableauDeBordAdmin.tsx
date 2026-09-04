import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import { AdminDashboardGraphiques } from '../../../components/admin/dashboard';

/**
 * Page d'accueil du panneau d'administration.
 * Affiche les ventes (KPIs, évolution, statuts) et les statistiques utilisateurs.
 */
export default function TableauDeBordAdmin() {
  return (
    <DispositionAdmin>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Tableau de bord</h1>
        <p className="text-sm text-[#74777d] mt-1">Vue d'ensemble de la plateforme ZANDOO.</p>
      </header>

      <AdminDashboardGraphiques />
    </DispositionAdmin>
  );
}
