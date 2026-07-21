import { Store, Clock, CheckCircle2, Ban } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import FiltresVendeurs from '../../../components/admin/vendeurs/FiltresVendeurs';
import TableauVendeurs from '../../../components/admin/vendeurs/TableauVendeurs';
import Pagination from '../../../components/admin/modal/Pagination';
import Alert from '../../../components/ui/Alert';
import { useGestionVendeurs } from '../../../hooks/admin/useGestionVendeurs';
import type { StatutVendeur } from '../../../types/admin';

/**
 * Page de gestion des vendeurs — liste + filtres + statistiques + actions.
 */
export default function ListeVendeursAdmin() {
  const {
    vendeurs,
    pagination,
    statistiques,
    chargement,
    chargementStatut,
    erreur,
    filtre,
    setFiltre,
    approuverVendeur,
    suspendreVendeur,
  } = useGestionVendeurs();

  return (
    <DispositionAdmin>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">Gestion des vendeurs</h1>
        <p className="text-sm text-[#74777d] mt-1">
          Validez, approuvez ou suspendez les comptes vendeurs.
        </p>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CarteStatistique titre="Total"       valeur={statistiques?.total      ?? 0} icone={Store}        couleur="primary"  />
        <CarteStatistique titre="En attente"  valeur={statistiques?.enAttente  ?? 0} icone={Clock}        couleur="warning"  />
        <CarteStatistique titre="Approuvés"   valeur={statistiques?.approuves  ?? 0} icone={CheckCircle2} couleur="success"  />
        <CarteStatistique titre="Suspendus"   valeur={statistiques?.suspendus  ?? 0} icone={Ban}          couleur="danger"   />
      </div>

      {/* Erreur globale */}
      {erreur && (
        <div className="mb-4">
          <Alert variant="error">{erreur}</Alert>
        </div>
      )}

      {/* Bloc filtres + tableau */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FiltresVendeurs
            recherche={filtre.recherche}
            statut={filtre.statut as StatutVendeur | ''}
            onRechercheChange={(v) => setFiltre({ recherche: v, page: 1 })}
            onStatutChange={(v) => setFiltre({ statut: v, page: 1 })}
          />
        </div>

        <div className="p-4">
          {chargement ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <TableauVendeurs
              vendeurs={vendeurs}
              chargementStatut={chargementStatut}
              onApprouver={approuverVendeur}
              onSuspendre={suspendreVendeur}
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
