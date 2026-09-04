import { useState } from 'react';
import { Truck, Clock, CheckCircle2, Ban, UserPlus, CheckSquare } from 'lucide-react';
import DispositionVendeur from '../../../components/vendeur/layout/DispositionVendeur';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import TableauLivreurs from '../../../components/vendeur/livreurs/TableauLivreurs';
import FiltresLivreurs from '../../../components/vendeur/livreurs/FiltresLivreurs';
import ModalCreationLivreur from '../../../components/vendeur/livreurs/ModalCreationLivreur';
import Pagination from '../../../components/admin/modal/Pagination';
import Alert from '../../../components/ui/Alert';
import { useGestionLivreursVendeur } from '../../../hooks/vendeur/useGestionLivreursVendeur';
import type { StatutLivreurVendeur } from '../../../types/vendeur/livreur';

/**
 * Page "Mes livreurs" dans l'espace vendeur.
 * Permet de créer, consulter, activer/suspendre et supprimer ses propres livreurs.
 */
export default function MesLivreursPage() {
  const {
    livreurs,
    pagination,
    statistiques,
    chargement,
    chargementAction,
    erreur,
    filtre,
    setFiltre,
    activerLivreur,
    suspendreLivreur,
    supprimerLivreur,
    renvoyerInvitation,
    recharger,
  } = useGestionLivreursVendeur();

  const [modalCreation, setModalCreation] = useState(false);

  return (
    <DispositionVendeur>

      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Mes livreurs</h1>
          <p className="text-sm text-[#74777d] mt-1">
            Gérez les livreurs rattachés à votre boutique.
          </p>
        </div>
        <button
          onClick={() => setModalCreation(true)}
          className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
        >
          <UserPlus size={16} aria-hidden="true" />
          Créer un livreur
        </button>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <CarteStatistique titre="Total"            valeur={statistiques?.total           ?? 0} icone={Truck}        couleur="primary" />
        <CarteStatistique titre="En attente"       valeur={statistiques?.enAttente       ?? 0} icone={Clock}        couleur="warning" />
        <CarteStatistique titre="Actifs"           valeur={statistiques?.actifs          ?? 0} icone={CheckCircle2} couleur="success" />
        <CarteStatistique titre="Suspendus"        valeur={statistiques?.suspendus       ?? 0} icone={Ban}          couleur="danger"  />
        <CarteStatistique titre="Profils complets" valeur={statistiques?.profilsComplets ?? 0} icone={CheckSquare}  couleur="accent"  />
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Filtres + tableau */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FiltresLivreurs
            recherche={filtre.recherche}
            statut={filtre.statut as StatutLivreurVendeur | ''}
            onRechercheChange={(v) => setFiltre({ recherche: v, page: 1 })}
            onStatutChange={(v)    => setFiltre({ statut: v,   page: 1 })}
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
            <TableauLivreurs
              livreurs={livreurs}
              chargementAction={chargementAction}
              onActiver={activerLivreur}
              onSuspendre={suspendreLivreur}
              onSupprimer={supprimerLivreur}
              onRenvoyerInvitation={renvoyerInvitation}
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

      {/* Modal création */}
      <ModalCreationLivreur
        ouvert={modalCreation}
        onFermer={() => setModalCreation(false)}
        onSucces={recharger}
      />

    </DispositionVendeur>
  );
}
