import { MessageSquare, Inbox, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import TableauReclamations from '../../../components/admin/reclamations/TableauReclamations';
import FiltresReclamations from '../../../components/admin/reclamations/FiltresReclamations';
import Pagination from '../../../components/admin/modal/Pagination';
import Alert from '../../../components/ui/Alert';
import { useGestionReclamations } from '../../../hooks/useGestionReclamations';
import type { StatutReclamation, PrioriteReclamation, CategorieReclamation } from '../../../types/admin';

export default function ListeReclamationsAdmin() {
  const {
    reclamations, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre,
  } = useGestionReclamations();

  return (
    <DispositionAdmin>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">Gestion des réclamations</h1>
        <p className="text-sm text-[#74777d] mt-1">
          Recevez, suivez et résolvez les réclamations des acheteurs et vendeurs.
        </p>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <CarteStatistique titre="Total"       valeur={statistiques?.total    ?? 0} icone={MessageSquare} couleur="primary" />
        <CarteStatistique titre="Ouverts"     valeur={statistiques?.ouverts  ?? 0} icone={Inbox}         couleur="accent"  />
        <CarteStatistique titre="En cours"    valeur={statistiques?.enCours  ?? 0} icone={Clock}         couleur="warning" />
        <CarteStatistique titre="Urgents"     valeur={statistiques?.urgents  ?? 0} icone={AlertTriangle} couleur="danger"  />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <CarteStatistique titre="En attente"  valeur={statistiques?.enAttente ?? 0} icone={Clock}         couleur="warning" />
        <CarteStatistique titre="Résolus"     valeur={statistiques?.resolus   ?? 0} icone={CheckCircle2}  couleur="success" />
        <CarteStatistique titre="Fermés"      valeur={statistiques?.fermes    ?? 0} icone={XCircle}       couleur="primary" />
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Filtres + tableau */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FiltresReclamations
            recherche={filtre.recherche}
            statut={filtre.statut as StatutReclamation | ''}
            priorite={filtre.priorite as PrioriteReclamation | ''}
            categorie={filtre.categorie as CategorieReclamation | ''}
            onRechercheChange={(v)  => setFiltre({ recherche:  v, page: 1 })}
            onStatutChange={(v)     => setFiltre({ statut:     v, page: 1 })}
            onPrioriteChange={(v)   => setFiltre({ priorite:   v, page: 1 })}
            onCategorieChange={(v)  => setFiltre({ categorie:  v, page: 1 })}
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
            <TableauReclamations
              reclamations={reclamations}
              chargementAction={chargementAction}
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
