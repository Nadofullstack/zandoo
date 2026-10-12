import { useEffect } from 'react';
import { Check, ChevronRight, CreditCard, FileText, Loader2, MapPin, Truck, X } from 'lucide-react';
import { ETAPES_CHECKOUT, useCheckout } from '../../../hooks/acheteur/useCheckout';
import type { EtapeCheckout } from '../../../hooks/acheteur/useCheckout';
import { lireSession } from '../../../services/auth/authService';
import { formatPrix } from '../commandes/configCommandes';
import EtapeAdresse from '../checkout/EtapeAdresse';
import EtapeLivraison from '../checkout/EtapeLivraison';
import EtapePaiement from '../checkout/EtapePaiement';
import EtapeConfirmation from '../checkout/EtapeConfirmation';

interface Props {
  ouvert: boolean;
  onFermer: () => void;
}

const LIBELLES_ETAPES: Record<EtapeCheckout, { label: string; icone: React.ReactNode }> = {
  adresse:      { label: 'Adresse',      icone: <MapPin size={14} /> },
  livraison:    { label: 'Livraison',    icone: <Truck size={14} /> },
  paiement:     { label: 'Paiement',     icone: <CreditCard size={14} /> },
  confirmation: { label: 'Confirmation', icone: <FileText size={14} /> },
};

/**
 * Tunnel de commande en 4 étapes : Adresse → Livraison → Paiement → Confirmation.
 * La logique vit dans useCheckout ; ce composant n'assure que la mise en page.
 */
export default function DrawerCommande({ ouvert, onFermer }: Props) {
  const session = lireSession();
  const c = useCheckout({ ouvert, nomParDefaut: session?.fullName, telephoneParDefaut: session?.phone });

  /* Fermer avec Échap (sauf pendant l'envoi) */
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => { if (e.key === 'Escape' && !c.envoi) onFermer(); };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, [onFermer, c.envoi]);

  /* Bloquer le défilement de la page */
  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [ouvert]);

  const confirmer = async () => {
    if (await c.confirmer()) {
      onFermer();
      /* Rechargement complet : le panier (vidé par le checkout) est relu depuis l'API */
      window.location.href = '/mes-commandes?confirmee=1';
    }
  };

  const indexEtape = ETAPES_CHECKOUT.indexOf(c.etape);
  const contientRetrait = Object.values(c.livraisons).includes('retrait');

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${ouvert ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => !c.envoi && onFermer()}
        aria-hidden="true"
      />

      <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${ouvert ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Passer commande"
          className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[94vh] sm:max-h-[90vh] flex flex-col transition-all duration-300 ${ouvert ? 'translate-y-0 sm:scale-100' : 'translate-y-4 sm:scale-95'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-black text-[#011023]">Passer commande</h2>
            <button onClick={onFermer} disabled={c.envoi} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>

          {/* Étapes */}
          <ol className="flex items-center px-6 py-3 gap-1 bg-gray-50 border-b border-gray-100">
            {ETAPES_CHECKOUT.map((e, i) => (
              <li key={e} className="flex items-center gap-1 flex-1" aria-current={i === indexEtape ? 'step' : undefined}>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                  i === indexEtape ? 'bg-[#FC7701] text-white' : i < indexEtape ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < indexEtape ? <Check size={14} /> : LIBELLES_ETAPES[e].icone}
                  <span className="hidden sm:block">{LIBELLES_ETAPES[e].label}</span>
                </span>
                {i < ETAPES_CHECKOUT.length - 1 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
              </li>
            ))}
          </ol>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {c.erreur && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700" role="alert">{c.erreur}</div>
            )}

            {c.etape === 'adresse' && (
              <EtapeAdresse
                adresses={c.carnet.adresses}
                chargement={c.carnet.chargement}
                choix={c.choixAdresse}
                onChoisir={c.setChoix}
                nomParDefaut={session?.fullName}
                telephoneParDefaut={session?.phone}
              />
            )}
            {c.etape === 'livraison' && c.adresseActive && (
              <EtapeLivraison
                ville={c.adresseActive.ville}
                boutiques={c.boutiques}
                livraisons={c.livraisons}
                onChoisir={(vendeurId, mode) => c.setLivraisons((l) => ({ ...l, [vendeurId]: mode }))}
              />
            )}
            {c.etape === 'paiement' && (
              <EtapePaiement paiement={c.paiement} onChange={c.setPaiement} contientRetrait={contientRetrait} />
            )}
            {c.etape === 'confirmation' && c.adresseActive && (
              <EtapeConfirmation
                adresse={c.adresseActive}
                boutiques={c.boutiques}
                livraisons={c.livraisons}
                paiement={c.paiement}
                totaux={c.totaux}
                onModifier={c.allerA}
              />
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 px-6 py-4 bg-white rounded-b-2xl">
            {c.etape !== 'adresse' && c.etape !== 'confirmation' && c.boutiques.length > 0 && (
              <p className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Total {c.totaux.frais ? 'avec livraison' : ''}</span>
                <span className="font-bold text-[#011023] tabular-nums">{formatPrix(c.totaux.total)}</span>
              </p>
            )}
            <div className="flex gap-3">
              {c.etape !== 'adresse' && (
                <button onClick={c.precedent} disabled={c.envoi} className="px-5 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Retour
                </button>
              )}
              {c.etape !== 'confirmation' ? (
                <button
                  onClick={c.suivant}
                  disabled={c.chargementOptions || c.carnet.chargement}
                  className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm bg-[#FC7701] hover:bg-[#e06900] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {c.chargementOptions && <Loader2 size={16} className="animate-spin" />}
                  Continuer
                </button>
              ) : (
                <button
                  onClick={confirmer}
                  disabled={c.envoi}
                  className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm bg-[#FC7701] hover:bg-[#e06900] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {c.envoi ? <><Loader2 size={16} className="animate-spin" /> Confirmation…</> : <>Confirmer · {formatPrix(c.totaux.total)}</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
