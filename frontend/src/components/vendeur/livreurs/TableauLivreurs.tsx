import { useState } from 'react';
import { Eye, UserCheck, Ban, Trash2, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import type { LivreurVendeur } from '../../../types/vendeur/livreur';
import BadgeStatutLivreur from './BadgeStatutLivreur';
import ModalConfirmation from '../../admin/modal/ModalConfirmation';
import ModalDetailLivreur from './ModalDetailLivreur';

interface Props {
  livreurs: LivreurVendeur[];
  chargementAction: string | null;
  onActiver: (id: string, raison?: string) => void;
  onSuspendre: (id: string, raison?: string) => void;
  onSupprimer: (id: string) => void;
  onRenvoyerInvitation: (id: string) => void;
}

type TypeModal = 'activer' | 'suspendre' | 'supprimer' | 'renvoi';

interface EtatModal {
  ouvert: boolean;
  type: TypeModal;
  id: string;
  nom: string;
}

const MODAL_INIT: EtatModal = { ouvert: false, type: 'activer', id: '', nom: '' };

const LIBELLE_VEHICULE: Record<string, string> = {
  moto:        'Moto',
  velo:        'Vélo',
  voiture:     'Voiture',
  camionnette: 'Camionnette',
  autre:       'Autre',
};

function AvatarLivreur({ livreur }: { livreur: LivreurVendeur }) {
  if (livreur.utilisateur?.avatar) {
    return (
      <img
        src={livreur.utilisateur.avatar}
        alt={livreur.utilisateur.fullName}
        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
      />
    );
  }
  const initiales = (livreur.utilisateur?.fullName ?? 'LV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-cyan-700">{initiales}</span>
    </div>
  );
}

export default function TableauLivreurs({
  livreurs,
  chargementAction,
  onActiver,
  onSuspendre,
  onSupprimer,
  onRenvoyerInvitation,
}: Props) {
  const [modal, setModal]               = useState<EtatModal>(MODAL_INIT);
  const [livreurDetailId, setLivreurDetailId] = useState<string | null>(null);

  const ouvrir = (type: TypeModal, l: LivreurVendeur) =>
    setModal({ ouvert: true, type, id: l._id, nom: l.utilisateur?.fullName ?? '—' });
  const fermer = () => setModal(MODAL_INIT);

  const handleConfirmer = (raison?: string) => {
    if (modal.type === 'activer')   onActiver(modal.id, raison);
    if (modal.type === 'suspendre') onSuspendre(modal.id, raison);
    if (modal.type === 'supprimer') onSupprimer(modal.id);
    if (modal.type === 'renvoi')    onRenvoyerInvitation(modal.id);
    fermer();
  };

  if (livreurs.length === 0) {
    return (
      <p className="text-center py-16 text-sm text-[#74777d]">
        Aucun livreur trouvé pour ces critères.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste de mes livreurs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Livreur', 'Contact', 'Véhicule', 'Ville', 'Profil', 'Statut', 'Ajouté le', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {livreurs.map((l) => {
              const enCours = chargementAction === l._id;
              return (
                <tr key={l._id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Livreur */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <AvatarLivreur livreur={l} />
                      <p className="font-semibold text-primary truncate max-w-[150px]">
                        {l.utilisateur?.fullName ?? '—'}
                      </p>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3.5">
                    <p className="text-primary text-xs truncate max-w-[150px]">{l.utilisateur?.email ?? '—'}</p>
                    <p className="text-[#74777d] text-xs mt-0.5">{l.telephone || l.utilisateur?.phone || '—'}</p>
                  </td>

                  {/* Véhicule */}
                  <td className="px-4 py-3.5">
                    <p className="text-primary text-xs">{l.typeVehicule ? LIBELLE_VEHICULE[l.typeVehicule] : '—'}</p>
                    {l.numeroplaque && (
                      <p className="text-[#74777d] text-xs font-mono mt-0.5">{l.numeroplaque}</p>
                    )}
                  </td>

                  {/* Ville */}
                  <td className="px-4 py-3.5 text-xs text-primary">{l.villeService || '—'}</td>

                  {/* Profil */}
                  <td className="px-4 py-3.5">
                    {l.profilComplete ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={13} aria-hidden="true" />Complet
                      </span>
                    ) : (
                      <span className="text-xs text-[#74777d]">Incomplet</span>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3.5"><BadgeStatutLivreur statut={l.statut} /></td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {enCours ? (
                        <Loader2 size={17} className="animate-spin text-accent" />
                      ) : (
                        <>
                          <button onClick={() => setLivreurDetailId(l._id)} title="Voir les détails"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <Eye size={16} />
                          </button>
                          {l.statut === 'suspendu' && (
                            <button onClick={() => ouvrir('activer', l)} title="Activer"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                              <UserCheck size={16} />
                            </button>
                          )}
                          {l.statut !== 'suspendu' && (
                            <button onClick={() => ouvrir('suspendre', l)} title="Suspendre"
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
                              <Ban size={16} />
                            </button>
                          )}
                          {!l.profilComplete && (
                            <button onClick={() => ouvrir('renvoi', l)} title="Renvoyer l'invitation"
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                              <Mail size={16} />
                            </button>
                          )}
                          <button onClick={() => ouvrir('supprimer', l)} title="Supprimer"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={16} />
                          </button>
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
        titre={
          modal.type === 'activer'   ? 'Activer ce livreur ?'      :
          modal.type === 'suspendre' ? 'Suspendre ce livreur ?'    :
          modal.type === 'renvoi'    ? "Renvoyer l'invitation ?"   :
                                       'Supprimer définitivement ?'
        }
        description={
          modal.type === 'activer'   ? `« ${modal.nom} » pourra à nouveau livrer.`                                                                          :
          modal.type === 'suspendre' ? `« ${modal.nom} » ne pourra plus accéder à la plateforme.`                                                            :
          modal.type === 'renvoi'    ? `Un nouvel email d'invitation sera envoyé à « ${modal.nom} » avec un nouveau mot de passe temporaire.`               :
                                       `Le compte de « ${modal.nom} » sera supprimé définitivement. Cette action est irréversible.`
        }
        labelConfirmer={
          modal.type === 'activer'   ? 'Activer'   :
          modal.type === 'suspendre' ? 'Suspendre' :
          modal.type === 'renvoi'    ? 'Renvoyer'  :
                                       'Supprimer'
        }
        variante={
          modal.type === 'activer' ? 'success' :
          modal.type === 'renvoi'  ? 'warning'  :
                                      'danger'
        }
        avecRaison={modal.type === 'suspendre'}
        labelRaison="Raison de la suspension (optionnel)"
        chargement={!!chargementAction}
        onConfirmer={handleConfirmer}
        onAnnuler={fermer}
      />

      <ModalDetailLivreur
        livreurId={livreurDetailId}
        onFermer={() => setLivreurDetailId(null)}
      />
    </>
  );
}
