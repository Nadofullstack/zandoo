import {
  ShoppingCart, Clock, CreditCard, Truck, CheckCircle2, XCircle,
} from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import CarteStatistique from '../../../components/admin/modal/CarteStatistique';
import TableauCommandes from '../../../components/admin/commandes/TableauCommandes';
import FiltresCommandes from '../../../components/admin/commandes/FiltresCommandes';
import Pagination from '../../../components/admin/modal/Pagination';
import Alert from '../../../components/ui/Alert';
import { useGestionCommandes } from '../../../hooks/useGestionCommandes';
import type { StatutCommande } from '../../../types/admin';

export default function ListeCommandesAdmin() {
  const {
    commandes, pagination, statistiques, chargement, chargementStatut, erreur,
    filtre, setFiltre, changerStatut,
  } = useGestionCommandes();

  return (
    <DispositionAdmin>

      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">Gestion des commandes</h1>
        <p className="text-sm text-[#74777d] mt-1">
          Suivez et gérez toutes les commandes passées sur la plateforme.
        </p>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <CarteStatistique titre="Total"       valeur={statistiques?.total      ?? 0} icone={ShoppingCart}  couleur="primary" />
        <CarteStatistique titre="En attente"  valeur={statistiques?.enAttente  ?? 0} icone={Clock}         couleur="warning" />
        <CarteStatistique titre="Payées"      valeur={statistiques?.payees     ?? 0} icone={CreditCard}    couleur="accent"  />
        <CarteStatistique titre="Expédiées"   valeur={statistiques?.expediees  ?? 0} icone={Truck}         couleur="primary" />
        <CarteStatistique titre="Livrées"     valeur={statistiques?.livrees    ?? 0} icone={CheckCircle2}  couleur="success" />
        <CarteStatistique titre="Annulées"    valeur={statistiques?.annulees   ?? 0} icone={XCircle}       couleur="danger"  />
      </div>

      {/* Chiffre d'affaires */}
      {statistiques && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl">
          <p className="text-sm text-[#74777d] font-medium">Chiffre d'affaires (commandes payées / expédiées / livrées)</p>
          <p className="text-2xl font-extrabold text-accent mt-1">
            {statistiques.chiffreAffaires.toLocaleString('fr-FR')} XOF
          </p>
        </div>
      )}

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Filtres + tableau */}
      <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <FiltresCommandes
            recherche={filtre.recherche}
            statut={filtre.statut as StatutCommande | ''}
            dateDebut={filtre.dateDebut}
            dateFin={filtre.dateFin}
            onRechercheChange={(v) => setFiltre({ recherche: v, page: 1 })}
            onStatutChange={(v)     => setFiltre({ statut: v,   page: 1 })}
            onDateDebutChange={(v)  => setFiltre({ dateDebut: v, page: 1 })}
            onDateFinChange={(v)    => setFiltre({ dateFin: v,   page: 1 })}
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
            <TableauCommandes
              commandes={commandes}
              chargementStatut={chargementStatut}
              onChangerStatut={changerStatut}
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
