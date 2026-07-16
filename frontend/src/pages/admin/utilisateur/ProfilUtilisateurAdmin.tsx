import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserX, Trash2, Pencil, X, Mail, Phone, Calendar, ShieldCheck, ShieldOff } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import BadgeRole from '../../../components/admin/utilisateurs/BadgeRole';
import FormulaireEditionUtilisateur from '../../../components/admin/utilisateurs/FormulaireEditionUtilisateur';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import {
  getUtilisateurParId,
  modifierUtilisateur,
  modifierStatutUtilisateur,
  supprimerUtilisateur,
} from '../../../services/adminUtilisateurService';
import type { UtilisateurAdmin, FormulaireUtilisateur } from '../../../types/admin';

type TypeModal = 'activer' | 'suspendre' | 'supprimer';

export default function ProfilUtilisateurAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [utilisateur, setUtilisateur] = useState<UtilisateurAdmin | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [modal, setModal] = useState<{ ouvert: boolean; type: TypeModal }>({ ouvert: false, type: 'activer' });

  /* Chargement initial */
  useEffect(() => {
    if (!id) return;
    let annule = false;
    (async () => {
      setChargement(true);
      try {
        const rep = await getUtilisateurParId(id);
        if (!annule) setUtilisateur(rep.data.utilisateur);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => { annule = true; };
  }, [id]);

  const afficherSucces = (msg: string) => {
    setMessageSucces(msg);
    setTimeout(() => setMessageSucces(null), 3000);
  };

  /* Modifier les informations */
  const handleModifier = async (donnees: Partial<FormulaireUtilisateur>) => {
    if (!id) return;
    setChargementAction(true);
    setErreur(null);
    try {
      const rep = await modifierUtilisateur(id, donnees);
      setUtilisateur(rep.data.utilisateur);
      setModeEdition(false);
      afficherSucces('Informations mises à jour.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de mise à jour.');
    } finally { setChargementAction(false); }
  };

  /* Confirmer action modale */
  const handleConfirmerModal = async () => {
    if (!id) return;
    setChargementAction(true);
    setModal((m) => ({ ...m, ouvert: false }));
    try {
      if (modal.type === 'supprimer') {
        await supprimerUtilisateur(id);
        navigate('/admin/utilisateurs');
      } else {
        const isActive = modal.type === 'activer';
        const rep = await modifierStatutUtilisateur(id, isActive);
        setUtilisateur(rep.data.utilisateur);
        afficherSucces(isActive ? 'Compte réactivé.' : 'Compte suspendu.');
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(false); }
  };

  /* ── Squelette de chargement ── */
  if (chargement) {
    return (
      <DispositionAdmin>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded bg-gray-200" />
          <div className="h-48 rounded-2xl bg-gray-200" />
          <div className="h-64 rounded-2xl bg-gray-200" />
        </div>
      </DispositionAdmin>
    );
  }

  if (!utilisateur) {
    return <DispositionAdmin><Alert variant="error">Utilisateur introuvable.</Alert></DispositionAdmin>;
  }

  /* Initiales pour l'avatar de remplacement */
  const initiales = utilisateur.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DispositionAdmin>

      {/* Retour */}
      <Link to="/admin/utilisateurs"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6">
        <ArrowLeft size={15} /> Retour à la liste
      </Link>

      {/* Messages */}
      {erreur        && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      {/* ── Carte profil ── */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

          {/* Avatar */}
          {utilisateur.avatar ? (
            <img src={utilisateur.avatar} alt={utilisateur.fullName}
              className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-primary">{initiales}</span>
            </div>
          )}

          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-extrabold text-primary">{utilisateur.fullName}</h1>
              <BadgeRole role={utilisateur.role} />
              {utilisateur.isVerified ? (
                <ShieldCheck size={16} className="text-green-600" title="Compte vérifié" />
              ) : (
                <ShieldOff size={16} className="text-gray-400" title="Non vérifié" />
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-[#74777d]">
              <span className="flex items-center gap-1.5"><Mail size={13} />{utilisateur.email}</span>
              {utilisateur.phone && (
                <span className="flex items-center gap-1.5"><Phone size={13} />{utilisateur.phone}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                Inscrit le {new Date(utilisateur.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </span>
            </div>

            {/* Statut actif */}
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${utilisateur.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {utilisateur.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                {utilisateur.isActive ? 'Compte actif' : 'Compte suspendu'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setModeEdition((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                modeEdition
                  ? 'bg-gray-100 text-[#74777d] hover:bg-gray-200'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {modeEdition ? <><X size={14} /> Annuler</> : <><Pencil size={14} /> Modifier</>}
            </button>

            {utilisateur.isActive ? (
              <button onClick={() => setModal({ ouvert: true, type: 'suspendre' })}
                disabled={chargementAction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
                <UserX size={14} /> Suspendre
              </button>
            ) : (
              <button onClick={() => setModal({ ouvert: true, type: 'activer' })}
                disabled={chargementAction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                <UserCheck size={14} /> Réactiver
              </button>
            )}

            {utilisateur.role !== 'admin' && (
              <button onClick={() => setModal({ ouvert: true, type: 'supprimer' })}
                disabled={chargementAction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                <Trash2 size={14} /> Supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Formulaire d'édition (affiché en inline) ── */}
      {modeEdition && (
        <div className="bg-surface border border-gray-200 rounded-2xl p-6 mb-5">
          <h2 className="text-base font-bold text-primary mb-4">Modifier les informations</h2>
          <FormulaireEditionUtilisateur
            utilisateur={utilisateur}
            chargement={chargementAction}
            onSoumettre={handleModifier}
            onAnnuler={() => setModeEdition(false)}
          />
        </div>
      )}

      {/* ── Infos complémentaires ── */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Informations du compte</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
          <InfoItem libelle="ID"              valeur={utilisateur._id} mono />
          <InfoItem libelle="Rôle"            valeur={utilisateur.role} />
          <InfoItem libelle="Statut"          valeur={utilisateur.isActive ? 'Actif' : 'Suspendu'} />
          <InfoItem libelle="Vérifié"         valeur={utilisateur.isVerified ? 'Oui' : 'Non'} />
          <InfoItem libelle="Connexion Google" valeur={utilisateur.googleId ? 'Oui' : 'Non'} />
          <InfoItem libelle="Dernière mise à jour"
            valeur={new Date(utilisateur.updatedAt).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })} />
        </dl>
      </div>

      {/* Modal confirmation */}
      <ModalConfirmation
        ouvert={modal.ouvert}
        titre={
          modal.type === 'activer'   ? 'Réactiver ce compte ?' :
          modal.type === 'suspendre' ? 'Suspendre ce compte ?' :
                                       'Supprimer définitivement ?'
        }
        description={
          modal.type === 'activer'   ? `« ${utilisateur.fullName} » pourra à nouveau se connecter.` :
          modal.type === 'suspendre' ? `« ${utilisateur.fullName} » ne pourra plus se connecter.` :
                                       `Le compte sera supprimé de façon permanente.`
        }
        labelConfirmer={
          modal.type === 'activer'   ? 'Réactiver' :
          modal.type === 'suspendre' ? 'Suspendre'  :
                                       'Supprimer'
        }
        variante={modal.type === 'activer' ? 'success' : 'danger'}
        chargement={chargementAction}
        onConfirmer={handleConfirmerModal}
        onAnnuler={() => setModal((m) => ({ ...m, ouvert: false }))}
      />

    </DispositionAdmin>
  );
}

/* ── Composant local : ligne d'information ── */
function InfoItem({ libelle, valeur, mono = false }: { libelle: string; valeur: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{libelle}</dt>
      <dd className={`mt-0.5 font-medium text-primary ${mono ? 'font-mono text-xs break-all' : ''}`}>{valeur}</dd>
    </div>
  );
}
