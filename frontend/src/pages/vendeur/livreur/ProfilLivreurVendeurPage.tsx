import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Truck, MapPin,
  UserCheck, Ban, RotateCcw, CheckCircle2,
} from 'lucide-react';
import DispositionVendeur from '../../../components/vendeur/layout/DispositionVendeur';
import BadgeStatutLivreur from '../../../components/vendeur/livreurs/BadgeStatutLivreur';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useProfilLivreurVendeur } from '../../../hooks/vendeur/useProfilLivreurVendeur';
import type { HistoriqueStatut } from '../../../types/admin/common';

const LIBELLE_VEHICULE: Record<string, string> = {
  moto:        'Moto',
  velo:        'Vélo',
  voiture:     'Voiture',
  camionnette: 'Camionnette',
  autre:       'Autre',
};

/* ── Composant local : ligne de définition ──────────────────────────────── */
function InfoLigne({
  libelle,
  valeur,
  spanFull = false,
  mono = false,
}: {
  libelle: string;
  valeur: string;
  spanFull?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={spanFull ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{libelle}</dt>
      <dd className={`mt-0.5 text-primary font-medium ${mono ? 'font-mono tracking-wider' : ''}`}>
        {valeur}
      </dd>
    </div>
  );
}

/* ── Historique des statuts ─────────────────────────────────────────────── */
function SectionHistorique({ historique }: { historique?: HistoriqueStatut[] }) {
  if (!historique?.length) return null;
  const triee = [...historique].reverse();
  return (
    <section className="bg-surface border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
        Historique des statuts
      </h2>
      <ol className="space-y-3">
        {triee.map((entree) => (
          <li key={entree._id} className="flex items-start gap-3 text-sm">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 mt-0.5 ${
              entree.statut === 'actif'    ? 'bg-green-100 text-green-700'   :
              entree.statut === 'suspendu' ? 'bg-red-100 text-red-700'      :
                                             'bg-yellow-100 text-yellow-700'
            }`}>
              {entree.statut === 'actif'    ? 'Actif'      :
               entree.statut === 'suspendu' ? 'Suspendu'   :
                                              'En attente'}
            </span>
            <div className="min-w-0">
              <p className="text-[#74777d] text-xs">
                {new Date(entree.modifieAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              {entree.raison && (
                <p className="mt-0.5 text-xs text-gray-500 italic">« {entree.raison} »</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Page de profil détaillé d'un livreur — espace vendeur.
 */
export default function ProfilLivreurVendeurPage() {
  const { id } = useParams<{ id: string }>();

  const {
    livreur,
    chargement,
    chargementAction,
    erreur,
    messageSucces,
    changerStatut,
    renvoyerInvitation,
  } = useProfilLivreurVendeur(id ?? '');

  const [modal, setModal] = useState<{
    ouvert: boolean;
    type: 'activer' | 'suspendre' | 'renvoi';
  }>({ ouvert: false, type: 'activer' });

  /* ── Skeleton ─────────────────────────────────────────────── */
  if (chargement) {
    return (
      <DispositionVendeur>
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-32 rounded-2xl bg-gray-200" />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 rounded-xl bg-gray-200" />
              <div className="h-36 rounded-xl bg-gray-200" />
            </div>
            <div className="h-40 rounded-xl bg-gray-200" />
          </div>
        </div>
      </DispositionVendeur>
    );
  }

  /* ── Introuvable ──────────────────────────────────────────── */
  if (!livreur) {
    return (
      <DispositionVendeur>
        <Alert variant="error">Livreur introuvable ou vous n'avez pas accès à ce profil.</Alert>
      </DispositionVendeur>
    );
  }

  const handleConfirmerModal = (raison?: string) => {
    if (modal.type === 'activer')   changerStatut('actif',    raison);
    if (modal.type === 'suspendre') changerStatut('suspendu', raison);
    if (modal.type === 'renvoi')    renvoyerInvitation();
    setModal((prev) => ({ ...prev, ouvert: false }));
  };

  const user       = livreur.utilisateur;
  const nomComplet = user?.fullName ?? '—';

  return (
    <DispositionVendeur>

      {/* Retour */}
      <Link
        to="/vendeur/livreurs"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à mes livreurs
      </Link>

      {/* Alertes */}
      {erreur       && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {messageSucces && <div className="mb-4"><Alert variant="success">{messageSucces}</Alert></div>}

      {/* ── En-tête profil ───────────────────────────────────── */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Avatar + infos */}
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={nomComplet}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-cyan-700">
                  {nomComplet.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-extrabold text-primary">{nomComplet}</h1>
                <BadgeStatutLivreur statut={livreur.statut} />
                {livreur.profilComplete ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} aria-hidden="true" /> Profil complet
                  </span>
                ) : (
                  <span className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full font-semibold">
                    Profil incomplet
                  </span>
                )}
              </div>
              <p className="text-sm text-[#74777d] mt-1">
                Ajouté le{' '}
                {new Date(livreur.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {livreur.statut === 'suspendu' && (
              <button
                onClick={() => setModal({ ouvert: true, type: 'activer' })}
                disabled={chargementAction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <UserCheck size={15} aria-hidden="true" />
                Activer
              </button>
            )}
            {livreur.statut !== 'suspendu' && (
              <button
                onClick={() => setModal({ ouvert: true, type: 'suspendre' })}
                disabled={chargementAction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Ban size={15} aria-hidden="true" />
                Suspendre
              </button>
            )}
            {!livreur.profilComplete && (
              <button
                onClick={() => setModal({ ouvert: true, type: 'renvoi' })}
                disabled={chargementAction}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-700 bg-blue-50 text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw size={15} aria-hidden="true" />
                Renvoyer l'invitation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Grille principale ────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">

          {/* Compte utilisateur */}
          <section className="bg-surface border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={15} className="text-accent" aria-hidden="true" />
              Compte utilisateur
            </h2>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <InfoLigne libelle="Nom complet"   valeur={user?.fullName  ?? '—'} />
              <InfoLigne libelle="Email"         valeur={user?.email     ?? '—'} />
              <InfoLigne libelle="Téléphone"     valeur={livreur.telephone || user?.phone || '—'} />
              <InfoLigne libelle="Email vérifié" valeur={user?.isVerified ? 'Oui' : 'Non'} />
              <InfoLigne libelle="Compte actif"  valeur={user?.isActive  ? 'Oui' : 'Non'} />
            </dl>
          </section>

          {/* Véhicule & zone */}
          <section className="bg-surface border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck size={15} className="text-accent" aria-hidden="true" />
              Véhicule &amp; zone de livraison
            </h2>
            {livreur.profilComplete ? (
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <InfoLigne libelle="Type de véhicule" valeur={livreur.typeVehicule ? LIBELLE_VEHICULE[livreur.typeVehicule] : '—'} />
                <InfoLigne libelle="Numéro de plaque" valeur={livreur.numeroplaque ?? '—'} mono />
                <InfoLigne libelle="Ville de service" valeur={livreur.villeService  ?? '—'} />
                <InfoLigne libelle="Zone de livraison" valeur={livreur.zonelivraison ?? '—'} spanFull />
              </dl>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                <MapPin size={16} className="shrink-0" aria-hidden="true" />
                <p>
                  Le livreur n'a pas encore complété son profil.
                  {!user?.isVerified && (
                    <> Il doit d'abord activer son compte via l'email d'invitation.</>
                  )}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          <SectionHistorique historique={livreur.historiqueStatut} />
        </div>
      </div>

      {/* ── Modal confirmation ──────────────────────────────── */}
      <ModalConfirmation
        ouvert={modal.ouvert}
        titre={
          modal.type === 'activer'   ? 'Activer ce livreur ?'     :
          modal.type === 'suspendre' ? 'Suspendre ce livreur ?'   :
                                       "Renvoyer l'invitation ?"
        }
        description={
          modal.type === 'activer'   ? `« ${nomComplet} » pourra à nouveau effectuer des livraisons.`                           :
          modal.type === 'suspendre' ? `« ${nomComplet} » ne pourra plus accéder à la plateforme.`                              :
                                       `Un nouvel email d'invitation sera envoyé à « ${user?.email} » avec de nouveaux identifiants.`
        }
        labelConfirmer={
          modal.type === 'activer'   ? 'Activer'   :
          modal.type === 'suspendre' ? 'Suspendre' :
                                       'Renvoyer'
        }
        variante={
          modal.type === 'activer' ? 'success' :
          modal.type === 'renvoi'  ? 'warning'  :
                                      'danger'
        }
        avecRaison={modal.type === 'suspendre'}
        labelRaison="Raison de la suspension (optionnel)"
        chargement={chargementAction}
        onConfirmer={handleConfirmerModal}
        onAnnuler={() => setModal((prev) => ({ ...prev, ouvert: false }))}
      />

    </DispositionVendeur>
  );
}
