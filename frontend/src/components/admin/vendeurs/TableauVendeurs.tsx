import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, CheckCircle, Ban, Loader2 } from 'lucide-react';
import type { Vendeur } from '../../../types/admin';
import BadgeStatut from '../modal/BadgeStatut';
import ModalConfirmation from '../modal/ModalConfirmation';

interface TableauVendeursProps {
  vendeurs: Vendeur[];
  chargementStatut: string | null;
  onApprouver: (id: string, raison?: string) => void;
  onSuspendre: (id: string, raison?: string) => void;
}

interface EtatModal {
  ouvert: boolean;
  type: 'approuver' | 'suspendre';
  vendeurId: string;
  nomVendeur: string;
}

const ETAT_MODAL_INITIAL: EtatModal = {
  ouvert: false,
  type: 'approuver',
  vendeurId: '',
  nomVendeur: '',
};

/**
 * Tableau listant les vendeurs avec actions approuver / suspendre / voir profil.
 */
export default function TableauVendeurs({
  vendeurs,
  chargementStatut,
  onApprouver,
  onSuspendre,
}: TableauVendeursProps) {
  const [modal, setModal] = useState<EtatModal>(ETAT_MODAL_INITIAL);

  const ouvrirModal = (type: 'approuver' | 'suspendre', vendeur: Vendeur) => {
    setModal({ ouvert: true, type, vendeurId: vendeur._id, nomVendeur: vendeur.nomEntreprise });
  };

  const fermerModal = () => setModal(ETAT_MODAL_INITIAL);

  const handleConfirmer = (raison?: string) => {
    if (modal.type === 'approuver') {
      onApprouver(modal.vendeurId, raison);
    } else {
      onSuspendre(modal.vendeurId, raison);
    }
    fermerModal();
  };

  if (vendeurs.length === 0) {
    return (
      <div className="text-center py-16 text-[#74777d] text-sm">
        Aucun vendeur trouvé pour ces critères.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des vendeurs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">Entreprise</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">Inscription</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendeurs.map((vendeur) => {
              const enCours = chargementStatut === vendeur._id;

              return (
                <tr key={vendeur._id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Entreprise */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-primary">{vendeur.nomEntreprise}</p>
                    <p className="text-xs text-[#74777d] mt-0.5">{vendeur.utilisateur?.nomComplet ?? '—'}</p>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3.5">
                    <p className="text-primary">{vendeur.emailContact || vendeur.utilisateur?.email || '—'}</p>
                    <p className="text-xs text-[#74777d] mt-0.5">{vendeur.telephoneContact || vendeur.utilisateur?.telephone || '—'}</p>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3.5">
                    <BadgeStatut statut={vendeur.statut} />
                  </td>

                  {/* Date d'inscription */}
                  <td className="px-4 py-3.5 text-[#74777d] text-xs whitespace-nowrap">
                    {new Date(vendeur.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {enCours ? (
                        <Loader2 size={18} className="animate-spin text-accent" />
                      ) : (
                        <>
                          {/* Approuver — disponible si en_attente ou suspendu */}
                          {vendeur.statut !== 'approuve' && (
                            <button
                              onClick={() => ouvrirModal('approuver', vendeur)}
                              title="Approuver"
                              aria-label={`Approuver ${vendeur.nomEntreprise}`}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <CheckCircle size={17} />
                            </button>
                          )}

                          {/* Suspendre — disponible si approuvé ou en_attente */}
                          {vendeur.statut !== 'suspendu' && (
                            <button
                              onClick={() => ouvrirModal('suspendre', vendeur)}
                              title="Suspendre"
                              aria-label={`Suspendre ${vendeur.nomEntreprise}`}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Ban size={17} />
                            </button>
                          )}

                          {/* Voir le profil */}
                          <Link
                            to={`/admin/vendeurs/${vendeur._id}`}
                            title="Voir le profil"
                            aria-label={`Voir le profil de ${vendeur.nomEntreprise}`}
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

      {/* Modal de confirmation */}
      <ModalConfirmation
        ouvert={modal.ouvert}
        titre={modal.type === 'approuver' ? 'Approuver ce vendeur ?' : 'Suspendre ce vendeur ?'}
        description={
          modal.type === 'approuver'
            ? `Vous allez approuver « ${modal.nomVendeur} ». Le vendeur pourra accéder à la plateforme.`
            : `Vous allez suspendre « ${modal.nomVendeur} ». Son accès sera immédiatement révoqué.`
        }
        labelConfirmer={modal.type === 'approuver' ? 'Approuver' : 'Suspendre'}
        variante={modal.type === 'approuver' ? 'success' : 'danger'}
        avecRaison={modal.type === 'suspendre'}
        labelRaison="Raison de la suspension (optionnel)"
        chargement={!!chargementStatut}
        onConfirmer={handleConfirmer}
        onAnnuler={fermerModal}
      />
    </>
  );
}
