import { useEffect, useState } from 'react';
import {
  X, User, Mail, Phone, Truck, MapPin,
  CheckCircle2, Clock,
  Loader2, AlertCircle,
} from 'lucide-react';
import BadgeStatutLivreur from './BadgeStatutLivreur';
import type { Livreur } from '../../../types/admin';
import { getLivreurParId } from '../../../services/admin/adminLivreurService';

interface Props {
  livreurId: string | null;
  onFermer: () => void;
}

const LIBELLE_VEHICULE: Record<string, string> = {
  moto:        'Moto',
  velo:        'Vélo',
  voiture:     'Voiture',
  camionnette: 'Camionnette',
  autre:       'Autre',
};

/* ── Ligne d'info ─────────────────────────────────────────────────────────── */
function LigneInfo({ label, valeur, mono = false }: { label: string; valeur: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#74777d] uppercase tracking-wider">{label}</dt>
      <dd className={`mt-0.5 text-primary font-medium text-sm ${mono ? 'font-mono tracking-wider' : ''}`}>
        {valeur}
      </dd>
    </div>
  );
}

/**
 * Modal de détails d'un livreur avec notes internes admin.
 * Charge les données à l'ouverture, puis permet de sauvegarder les notes.
 */
export default function ModalDetailLivreur({ livreurId, onFermer }: Props) {
  const [livreur, setLivreur]           = useState<Livreur | null>(null);
  const [chargement, setChargement]     = useState(false);
  const [erreur, setErreur]             = useState<string | null>(null);

  /* Charger le livreur à l'ouverture */
  useEffect(() => {
    if (!livreurId) return;

    let annule = false;
    setChargement(true);
    setErreur(null);
    setLivreur(null);

    getLivreurParId(livreurId)
      .then((rep) => {
        if (annule) return;
        setLivreur(rep.data.livreur);
      })
      .catch((err) => {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => { annule = true; };
  }, [livreurId]);

  if (!livreurId) return null;

  const nomComplet   = livreur?.utilisateur?.fullName ?? '—';
  const initiales    = nomComplet.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const historiqueTriee = livreur?.historiqueStatut ? [...livreur.historiqueStatut].reverse() : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-detail-livreur-titre"
    >
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-xl">
              <Truck size={18} className="text-cyan-700" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-detail-livreur-titre" className="text-base font-bold text-primary">
                Détails du livreur
              </h2>
              <p className="text-xs text-[#74777d]">Informations complètes et notes internes.</p>
            </div>
          </div>
          <button
            onClick={onFermer}
            aria-label="Fermer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Chargement */}
          {chargement && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#74777d]">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm">Chargement du profil…</p>
            </div>
          )}

          {/* Erreur */}
          {erreur && !chargement && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {erreur}
            </div>
          )}

          {/* Contenu */}
          {livreur && !chargement && (
            <>
              {/* En-tête profil */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                {livreur.utilisateur?.avatar ? (
                  <img
                    src={livreur.utilisateur.avatar}
                    alt={nomComplet}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-cyan-700">{initiales}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-primary text-base">{nomComplet}</p>
                    <BadgeStatutLivreur statut={livreur.statut} />
                    {livreur.profilComplete ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} aria-hidden="true" /> Profil complet
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                        Profil incomplet
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#74777d] mt-1">
                    Inscrit le{' '}
                    {new Date(livreur.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Compte utilisateur */}
              <section className="bg-surface border border-gray-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User size={13} className="text-accent" aria-hidden="true" />
                  Compte utilisateur
                </h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <LigneInfo label="Nom complet"    valeur={livreur.utilisateur?.fullName ?? '—'} />
                  <LigneInfo label="Email"          valeur={livreur.utilisateur?.email    ?? '—'} />
                  <LigneInfo label="Téléphone"      valeur={livreur.telephone || livreur.utilisateur?.phone || '—'} />
                  <LigneInfo label="Email vérifié"  valeur={livreur.utilisateur?.isVerified ? 'Oui' : 'Non'} />
                  <LigneInfo label="Compte actif"   valeur={livreur.utilisateur?.isActive  ? 'Oui' : 'Non'} />
                </dl>
              </section>

              {/* Véhicule & zone */}
              <section className="bg-surface border border-gray-200 rounded-xl p-4">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck size={13} className="text-accent" aria-hidden="true" />
                  Véhicule &amp; zone de livraison
                </h3>
                {livreur.profilComplete ? (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <LigneInfo label="Type de véhicule" valeur={livreur.typeVehicule ? LIBELLE_VEHICULE[livreur.typeVehicule] : '—'} />
                    <LigneInfo label="Plaque"           valeur={livreur.numeroplaque ?? '—'} mono />
                    <LigneInfo label="Ville"            valeur={livreur.villeService ?? '—'} />
                    <LigneInfo label="Zone"             valeur={livreur.zonelivraison ?? '—'} />
                  </dl>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <MapPin size={14} className="shrink-0" aria-hidden="true" />
                    Le livreur n'a pas encore complété son profil.
                  </div>
                )}
              </section>

              {/* Historique des statuts */}
              {historiqueTriee.length > 0 && (
                <section className="bg-surface border border-gray-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock size={13} className="text-accent" aria-hidden="true" />
                    Historique des statuts
                  </h3>
                  <ol className="space-y-3">
                    {historiqueTriee.map((entree) => (
                      <li key={entree._id} className="flex items-start gap-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 mt-0.5 ${
                          entree.statut === 'actif'      ? 'bg-green-100 text-green-700'  :
                          entree.statut === 'suspendu'   ? 'bg-red-100 text-red-700'     :
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
                            {entree.modifiePar && (
                              <> · par <span className="font-semibold text-primary">{entree.modifiePar.nomComplet}</span></>
                            )}
                          </p>
                          {entree.raison && (
                            <p className="mt-0.5 text-xs text-gray-500 italic">« {entree.raison} »</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onFermer}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#74777d] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
