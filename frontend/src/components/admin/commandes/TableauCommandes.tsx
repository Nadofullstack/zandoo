import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import type { Commande, StatutCommande } from '../../../types/admin';
import BadgeStatutCommande from './BadgeStatutCommande';
import ModalConfirmation from '../modal/ModalConfirmation';

interface TableauCommandesProps {
  commandes: Commande[];
  chargementStatut: string | null;
  onChangerStatut: (id: string, statut: StatutCommande, raison?: string) => void;
}

interface EtatModal {
  ouvert: boolean;
  commandeId: string;
  numeroCommande: string;
  statut: StatutCommande;
}

const ETAT_MODAL_INITIAL: EtatModal = {
  ouvert: false,
  commandeId: '',
  numeroCommande: '',
  statut: 'en_attente',
};

/* Transitions de statut autorisées depuis l'interface */
const TRANSITIONS: Record<StatutCommande, { statut: StatutCommande; libelle: string; classes: string }[]> = {
  en_attente: [
    { statut: 'payee',    libelle: 'Marquer payée',    classes: 'text-blue-600   hover:bg-blue-50'   },
    { statut: 'annulee',  libelle: 'Annuler',           classes: 'text-red-500    hover:bg-red-50'    },
  ],
  payee: [
    { statut: 'expediee', libelle: 'Marquer expédiée', classes: 'text-purple-600 hover:bg-purple-50' },
    { statut: 'annulee',  libelle: 'Annuler',           classes: 'text-red-500    hover:bg-red-50'    },
  ],
  expediee: [
    { statut: 'livree',   libelle: 'Marquer livrée',   classes: 'text-green-600  hover:bg-green-50'  },
  ],
  livree:    [],
  annulee:   [],
};

/**
 * Tableau listant les commandes avec actions de changement de statut.
 */
export default function TableauCommandes({
  commandes, chargementStatut, onChangerStatut,
}: TableauCommandesProps) {
  const [modal, setModal] = useState<EtatModal>(ETAT_MODAL_INITIAL);

  const ouvrirModal = (commande: Commande, statut: StatutCommande) => {
    setModal({ ouvert: true, commandeId: commande._id, numeroCommande: commande.numero, statut });
  };

  const handleConfirmer = (raison?: string) => {
    onChangerStatut(modal.commandeId, modal.statut, raison);
    setModal(ETAT_MODAL_INITIAL);
  };

  if (commandes.length === 0) {
    return (
      <div className="text-center py-16 text-[#74777d] text-sm">
        Aucune commande trouvée pour ces critères.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des commandes">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Numéro', 'Acheteur', 'Total', 'Statut', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {commandes.map((commande) => {
              const enCours = chargementStatut === commande._id;
              const transitions = TRANSITIONS[commande.statut] ?? [];

              return (
                <tr key={commande._id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Numéro */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-semibold text-primary bg-gray-100 px-2 py-0.5 rounded">
                      {commande.numero}
                    </span>
                    <p className="text-xs text-[#74777d] mt-1">
                      {commande.lignes.length} article{commande.lignes.length > 1 ? 's' : ''}
                    </p>
                  </td>

                  {/* Acheteur */}
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-primary">{commande.acheteur?.fullName ?? '—'}</p>
                    <p className="text-xs text-[#74777d] mt-0.5">{commande.acheteur?.email ?? '—'}</p>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">
                    {commande.total.toLocaleString('fr-FR')} {commande.devise}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3.5">
                    <BadgeStatutCommande statut={commande.statut} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                    {new Date(commande.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {enCours ? (
                        <Loader2 size={18} className="animate-spin text-accent" />
                      ) : (
                        <>
                          {/* Transitions disponibles */}
                          {transitions.map((t) => (
                            <button
                              key={t.statut}
                              onClick={() => ouvrirModal(commande, t.statut)}
                              title={t.libelle}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${t.classes}`}
                            >
                              {t.libelle}
                            </button>
                          ))}

                          {/* Voir le détail */}
                          <Link
                            to={`/admin/commandes/${commande._id}`}
                            title="Voir le détail"
                            aria-label={`Voir la commande ${commande.numero}`}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye size={17} />
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ModalConfirmation
        ouvert={modal.ouvert}
        titre={`Confirmer la mise à jour ?`}
        description={`La commande ${modal.numeroCommande} passera au statut « ${modal.statut} ».`}
        labelConfirmer="Confirmer"
        variante={modal.statut === 'annulee' ? 'danger' : 'success'}
        avecRaison={modal.statut === 'annulee'}
        labelRaison="Raison de l'annulation (optionnel)"
        chargement={!!chargementStatut}
        onConfirmer={handleConfirmer}
        onAnnuler={() => setModal(ETAT_MODAL_INITIAL)}
      />
    </>
  );
}
