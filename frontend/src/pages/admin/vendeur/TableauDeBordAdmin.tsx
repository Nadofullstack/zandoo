import { Store, Clock, CheckCircle2, Ban } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import { useGestionVendeurs } from '../../../hooks/admin/useGestionVendeurs';
import { AdminDashboardGraphiques } from '../../../components/admin/dashboard';

/**
 * Page d'accueil du panneau d'administration.
 * Affiche les statistiques globales des vendeurs et les graphiques utilisateurs.
 */
export default function TableauDeBordAdmin() {
  const { statistiques, chargement } = useGestionVendeurs();

  return (
    <DispositionAdmin>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Tableau de bord</h1>
        <p className="text-sm text-[#74777d] mt-1">Vue d'ensemble de la plateforme ZANDOO.</p>
      </header>

      {/* ── Statistiques vendeurs ─────────────────────────────────────────── */}
      {chargement ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <section aria-label="Statistiques vendeurs" className="mb-10">
          <h2 className="text-xs font-semibold text-[#74777d] uppercase tracking-wider mb-3">
            Vendeurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <CarteStatistique titre="Total"       valeur={statistiques?.total      ?? 0} icone={Store}        couleur="primary"  />
            <CarteStatistique titre="En attente"  valeur={statistiques?.enAttente  ?? 0} icone={Clock}        couleur="warning"  />
            <CarteStatistique titre="Approuvés"   valeur={statistiques?.approuves  ?? 0} icone={CheckCircle2} couleur="success"  />
            <CarteStatistique titre="Suspendus"   valeur={statistiques?.suspendus  ?? 0} icone={Ban}          couleur="danger"   />
          </div>
        </section>
      )}

      {/* ── Graphiques utilisateurs ───────────────────────────────────────── */}
      <section aria-label="Graphiques et statistiques utilisateurs">
        <AdminDashboardGraphiques />
      </section>
    </DispositionAdmin>
  );
}
