import { useState } from 'react';
import { Eye, UserCheck, UserX, Trash2, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import type { UtilisateurAdmin } from '../../../types/admin';
import BadgeRole from './BadgeRole';
import ModalConfirmation from '../modal/ModalConfirmation';
import ModalProfilUtilisateur from './ModalProfilUtilisateur';

interface Props {
  utilisateurs: UtilisateurAdmin[];
  chargementAction: string | null;
  onActiver: (id: string) => void;
  onSuspendre: (id: string) => void;
  onSupprimer: (id: string) => void;
}

type TypeModal = 'activer' | 'suspendre' | 'supprimer';
interface EtatModal { ouvert: boolean; type: TypeModal; id: string; nom: string; }
const MODAL_INIT: EtatModal = { ouvert: false, type: 'activer', id: '', nom: '' };

function AvatarUtilisateur({ utilisateur }: { utilisateur: UtilisateurAdmin }) {
  if (utilisateur.avatar) {
    return (
      <img src={utilisateur.avatar} alt={utilisateur.fullName}
        className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0" />
    );
  }
  const initiales = utilisateur.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary">{initiales}</span>
    </div>
  );
}

export default function TableauUtilisateurs({ utilisateurs, chargementAction, onActiver, onSuspendre, onSupprimer }: Props) {
  const [modal, setModal] = useState<EtatModal>(MODAL_INIT);
  const [utilisateurProfil, setUtilisateurProfil] = useState<UtilisateurAdmin | null>(null);

  const ouvrir = (type: TypeModal, u: UtilisateurAdmin) =>
    setModal({ ouvert: true, type, id: u._id, nom: u.fullName });
  const fermer = () => setModal(MODAL_INIT);

  const handleConfirmer = () => {
    if (modal.type === 'activer')   onActiver(modal.id);
    if (modal.type === 'suspendre') onSuspendre(modal.id);
    if (modal.type === 'supprimer') onSupprimer(modal.id);
    fermer();
  };

  if (utilisateurs.length === 0) {
    return <p className="text-center py-16 text-sm text-[#74777d]">Aucun utilisateur trouvé pour ces critères.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm" aria-label="Liste des utilisateurs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Utilisateur', 'Contact', 'Rôle', 'Statut', 'Vérifié', 'Inscription', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#74777d] uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {utilisateurs.map((u) => {
              const enCours = chargementAction === u._id;
              return (
                <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">

                  {/* Utilisateur */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <AvatarUtilisateur utilisateur={u} />
                      <div className="min-w-0">
                        <p className="font-semibold text-primary truncate max-w-[160px]">{u.fullName}</p>
                        {u.googleId && (
                          <span className="text-xs text-[#74777d]">via Google</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3.5">
                    <p className="text-primary text-xs">{u.email}</p>
                    <p className="text-[#74777d] text-xs mt-0.5">{u.phone || '—'}</p>
                  </td>

                  {/* Rôle */}
                  <td className="px-4 py-3.5">
                    <BadgeRole role={u.role} />
                  </td>

                  {/* Statut actif */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.isActive ? 'text-green-700' : 'text-red-600'}`}>
                      {u.isActive ? (
                        <><UserCheck size={13} />Actif</>
                      ) : (
                        <><UserX size={13} />Suspendu</>
                      )}
                    </span>
                  </td>

                  {/* Vérifié */}
                  <td className="px-4 py-3.5">
                    {u.isVerified ? (
                      <ShieldCheck size={16} className="text-green-600" aria-label="Compte vérifié" />
                    ) : (
                      <ShieldOff size={16} className="text-gray-400" aria-label="Non vérifié" />
                    )}
                  </td>

                  {/* Date inscription */}
                  <td className="px-4 py-3.5 text-xs text-[#74777d] whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('fr-FR', {
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
                          {/* Voir profil — ouvre le modal */}
                          <button
                            onClick={() => setUtilisateurProfil(u)}
                            title="Voir le profil"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Activer / Suspendre */}
                          {u.isActive ? (
                            <button onClick={() => ouvrir('suspendre', u)} title="Suspendre"
                              className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors">
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button onClick={() => ouvrir('activer', u)} title="Réactiver"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                              <UserCheck size={16} />
                            </button>
                          )}

                          {/* Supprimer */}
                          {u.role !== 'admin' && (
                            <button onClick={() => ouvrir('supprimer', u)} title="Supprimer"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
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
          modal.type === 'activer'   ? 'Réactiver ce compte ?' :
          modal.type === 'suspendre' ? 'Suspendre ce compte ?' :
                                       'Supprimer définitivement ?'
        }
        description={
          modal.type === 'activer'   ? `« ${modal.nom} » pourra à nouveau se connecter.` :
          modal.type === 'suspendre' ? `« ${modal.nom} » ne pourra plus se connecter tant que le compte est suspendu.` :
                                       `Le compte de « ${modal.nom} » sera supprimé définitivement. Cette action est irréversible.`
        }
        labelConfirmer={
          modal.type === 'activer'   ? 'Réactiver' :
          modal.type === 'suspendre' ? 'Suspendre'  :
                                       'Supprimer'
        }
        variante={modal.type === 'activer' ? 'success' : 'danger'}
        chargement={!!chargementAction}
        onConfirmer={handleConfirmer}
        onAnnuler={fermer}
      />

      {/* Modal profil utilisateur */}
      <ModalProfilUtilisateur
        utilisateur={utilisateurProfil}
        onFermer={() => setUtilisateurProfil(null)}
      />
    </>
  );
}
