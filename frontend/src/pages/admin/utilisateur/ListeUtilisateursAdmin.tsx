import { Users, UserCheck, UserX, ShoppingBag, Store } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import TableauUtilisateurs from '../../../components/admin/utilisateurs/TableauUtilisateurs';
import FiltresUtilisateurs from '../../../components/admin/utilisateurs/FiltresUtilisateurs';
import Pagination from '../../../components/admin/modal/Pagination';
import Alert from '../../../components/ui/Alert';
import { useGestionUtilisateurs } from '../../../hooks/admin/useGestionUtilisateurs';
import type { RoleUtilisateur } from '../../../types/admin';

export default function ListeUtilisateursAdmin() {
  const {
    utilisateurs, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre,
    activerUtilisateur, suspendreUtilisateur, supprimerUtilisateur,
  } = useGestionUtilisateurs();

  return (
    <DispositionAdmin>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">Gestion des utilisateurs</h1>
        <p className="text-sm text-[#74777d] mt-1">
          Consultez, modifiez et gérez tous les comptes de la plateforme.
        </p>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <CarteStatistique titre="Total"     valeur={statistiques?.total     ?? 0} icone={Users}      couleur="primary" />
        <CarteStatistique titre="Actifs"    valeur={statistiques?.actifs    ?? 0} icone={UserCheck}  couleur="success" />
        <CarteStatistique titre="Suspendus" valeur={statistiques?.suspendus ?? 0} icone={UserX}      couleur="danger"  />
        <CarteStatistique titre="Acheteurs" valeur={statistiques?.acheteurs ?? 0} icone={ShoppingBag} couleur="primary" />
        <CarteStatistique titre="Vendeurs"  valeur={statistiques?.vendeurs  ?? 0} icone={Store}      couleur="accent"  />
        <CarteStatistique titre="Admins"    valeur={statistiques?.admins    ?? 0} icone={Users}      couleur="warning" />
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Filtres + tableau */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FiltresUtilisateurs
            recherche={filtre.recherche}
            role={filtre.role as RoleUtilisateur | ''}
            actif={filtre.actif}
            dateDebut={filtre.dateDebut}
            dateFin={filtre.dateFin}
            onRechercheChange={(v) => setFiltre({ recherche: v, page: 1 })}
            onRoleChange={(v)      => setFiltre({ role: v,      page: 1 })}
            onActifChange={(v)     => setFiltre({ actif: v,     page: 1 })}
            onDateDebutChange={(v) => setFiltre({ dateDebut: v, page: 1 })}
            onDateFinChange={(v)   => setFiltre({ dateFin: v,   page: 1 })}
          />
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <TableauUtilisateurs
              utilisateurs={utilisateurs}
              chargementAction={chargementAction}
              onActiver={activerUtilisateur}
              onSuspendre={suspendreUtilisateur}
              onSupprimer={supprimerUtilisateur}
            />
          )}

          {pagination && !chargement && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limite={pagination.limite}
              onChangerPage={(p) => setFiltre({ page: p })}
            />
          )}
        </div>
      </div>

    </DispositionAdmin>
  );
}
