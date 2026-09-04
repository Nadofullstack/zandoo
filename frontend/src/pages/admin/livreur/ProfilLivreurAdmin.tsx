import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Truck, MapPin,
  Trash2, CheckCircle2,
} from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import BadgeStatutLivreur from '../../../components/admin/livreurs/BadgeStatutLivreur';
import HistoriqueStatut from '../../../components/admin/vendeurs/HistoriqueStatut';
import ModalConfirmation from '../../../components/admin/modal/ModalConfirmation';
import Alert from '../../../components/ui/Alert';
import { useProfilLivreur } from '../../../hooks/admin/useProfilLivreur';
import { supprimerLivreur } from '../../../services/admin/adminLivreurService';

const LIBELLE_VEHICULE: Record<string, string> = {
  moto:        'Moto',
  velo:        'Vélo',
  voiture:     'Voiture',
  camionnette: 'Camionnette',
  autre:       'Autre',
};

interface InfoLigneProps {
  libelle: string;
  valeur: string;
  icone?: React.ComponentType<{ size?: number; className?: string }>;
  spanFull?: boolean;
  mono?: boolean;
}

function InfoLigne({ libelle, valeur, spanFull, mono }: InfoLigneProps) {
  return (
    <div className={spanFull ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{libelle}</dt>
      <dd className={`mt-0.5 text-primary font-medium ${mono ? 'font-mono tracking-wider' : ''}`}>
        {valeur}
      </dd>
    </div>
  );
}

/**
 * Page de profil détaillé d'un livreur — espace admin.
 * Actions disponibles : voir les détails, supprimer le compte.
 */
export default function ProfilLivreurAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { livreur, chargement, erreur } = useProfilLivreur(id ?? '');

  const [modalSuppression, setModalSuppression] = useState(false);
  const [chargementSuppression, setChargementSuppression] = useState(false);
  const [erreurSuppression, setErreurSuppression]         = useState<string | null>(null);

  const handleSupprimer = async () => {
    if (!id) return;
    setChargementSuppression(true);
    setErreurSuppression(null);
    try {
      await supprimerLivreur(id);
      navigate('/admin/livreurs', { replace: true });
    } catch (err) {
      setErreurSuppression(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
      setModalSuppression(false);
    } finally {
      setChargementSuppression(false);
    }
  };

  /* ── Skeleton ─────────────────────────────────────────────── */
  if (chargement) {
    return (
      <DispositionAdmin>
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-32 rounded-2xl bg-gray-200" />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 rounded-xl bg-gray-200" />
              <div className="h-36 rounded-xl bg-gray-200" />
            </div>
            <div className="space-y-4">
              <div className="h-40 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </DispositionAdmin>
    );
  }

  /* ── Introuvable ──────────────────────────────────────────── */
  if (!livreur) {
    return (
      <DispositionAdmin>
        <Alert variant="error">Livreur introuvable.</Alert>
      </DispositionAdmin>
    );
  }

  const user       = livreur.utilisateur;
  const nomComplet = user?.fullName ?? '—';

  return (
    <DispositionAdmin>

      {/* Retour */}
      <Link
        to="/admin/livreurs"
        className="inline-flex items-center gap-1.5 text-sm text-[#74777d] hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Retour à la liste
      </Link>

      {/* Alertes */}
      {erreur           && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}
      {erreurSuppression && <div className="mb-4"><Alert variant="error">{erreurSuppression}</Alert></div>}

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
                Compte créé le{' '}
                {new Date(livreur.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
              {/* Boutique du vendeur créateur */}
              {(livreur as any).creerPar?.nomEntreprise && (
                <p className="text-xs text-[#74777d] mt-0.5">
                  Créé par la boutique{' '}
                  <span className="font-semibold text-primary">
                    {(livreur as any).creerPar.nomEntreprise}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Bouton supprimer uniquement */}
          <button
            onClick={() => setModalSuppression(true)}
            disabled={chargementSuppression}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 shrink-0"
          >
            <Trash2 size={15} aria-hidden="true" />
            Supprimer ce livreur
          </button>
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
              <InfoLigne libelle="Nom complet"   valeur={user?.fullName  ?? '—'} icone={User}  />
              <InfoLigne libelle="Email"         valeur={user?.email     ?? '—'} icone={Mail}  />
              <InfoLigne libelle="Téléphone"     valeur={livreur.telephone || user?.phone || '—'} icone={Phone} />
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
                <InfoLigne libelle="Ville de service" valeur={livreur.villeService  ?? '—'} icone={MapPin} />
                <InfoLigne libelle="Zone de livraison" valeur={livreur.zonelivraison ?? '—'} spanFull />
              </dl>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                <span className="text-lg" aria-hidden="true">⏳</span>
                <p>
                  Le livreur n'a pas encore complété son profil.
                  {!livreur.utilisateur?.isVerified && (
                    <> Il doit d'abord activer son compte via l'email d'invitation.</>
                  )}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Colonne latérale — historique des statuts */}
        <div className="space-y-5">
          <HistoriqueStatut historique={livreur.historiqueStatut} />
        </div>
      </div>

      {/* ── Modal confirmation suppression ──────────────────── */}
      <ModalConfirmation
        ouvert={modalSuppression}
        titre="Supprimer ce livreur ?"
        description={`Le compte de « ${nomComplet} » sera supprimé définitivement. Cette action est irréversible.`}
        labelConfirmer="Supprimer définitivement"
        variante="danger"
        avecRaison={false}
        chargement={chargementSuppression}
        onConfirmer={handleSupprimer}
        onAnnuler={() => setModalSuppression(false)}
      />

    </DispositionAdmin>
  );
}
