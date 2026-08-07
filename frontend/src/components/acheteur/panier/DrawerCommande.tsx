import { useEffect, useState } from 'react';
import { X, MapPin, CreditCard, FileText, Loader2, ChevronRight } from 'lucide-react';
import { usePanier } from '../../../context/PanierContext';

interface Props {
  ouvert: boolean;
  onFermer: () => void;
}

type Etape = 'adresse' | 'paiement' | 'confirmation';

interface FormAdresse {
  nomComplet: string;
  ville: string;
  quartier: string;
  telephone: string;
  instructions: string;
}

interface FormPaiement {
  methode: 'mobile_money' | 'cash_livraison' | '';
  numeroMobile: string;
}

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}

export default function DrawerCommande({ ouvert, onFermer }: Props) {
  const { panier } = usePanier();
  const [etape, setEtape] = useState<Etape>('adresse');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const [adresse, setAdresse] = useState<FormAdresse>({
    nomComplet: '',
    ville: '',
    quartier: '',
    telephone: '',
    instructions: '',
  });

  const [paiement, setPaiement] = useState<FormPaiement>({
    methode: '',
    numeroMobile: '',
  });

  /* Fermer avec Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onFermer]);

  /* Bloquer le scroll */
  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [ouvert]);

  /* Réinitialiser à la fermeture */
  useEffect(() => {
    if (!ouvert) {
      setTimeout(() => {
        setEtape('adresse');
        setErreur(null);
      }, 300);
    }
  }, [ouvert]);

  const validerAdresse = () => {
    if (!adresse.nomComplet.trim()) return 'Le nom complet est requis.';
    if (!adresse.ville.trim()) return 'La ville est requise.';
    if (!adresse.telephone.trim()) return 'Le téléphone est requis.';
    return null;
  };

  const validerPaiement = () => {
    if (!paiement.methode) return 'Choisissez une méthode de paiement.';
    if (paiement.methode === 'mobile_money' && !paiement.numeroMobile.trim()) {
      return 'Le numéro mobile money est requis.';
    }
    return null;
  };

  const passerEtape = () => {
    setErreur(null);
    if (etape === 'adresse') {
      const err = validerAdresse();
      if (err) { setErreur(err); return; }
      setEtape('paiement');
    } else if (etape === 'paiement') {
      const err = validerPaiement();
      if (err) { setErreur(err); return; }
      setEtape('confirmation');
    }
  };

  const confirmerCommande = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      const { data } = await import('../../../services/api').then((m) => m.default.post('/acheteur/checkout', {
        adresseLivraison: {
          nomComplet:   adresse.nomComplet,
          ville:        adresse.ville,
          quartier:     adresse.quartier,
          telephone:    adresse.telephone,
          instructions: adresse.instructions,
        },
        paiement: {
          methode:       paiement.methode,
          numeroMobile:  paiement.numeroMobile,
        },
      }));
      if (data.success) {
        onFermer();
        /* Recharger le panier (il sera vide après checkout) */
        window.location.href = '/mes-commandes';
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la commande.');
    } finally {
      setEnvoi(false);
    }
  };

  const ETAPES: { id: Etape; label: string; icone: React.ReactNode }[] = [
    { id: 'adresse',      label: 'Livraison',   icone: <MapPin size={14} /> },
    { id: 'paiement',     label: 'Paiement',    icone: <CreditCard size={14} /> },
    { id: 'confirmation', label: 'Confirmation', icone: <FileText size={14} /> },
  ];

  const indexEtape = ETAPES.findIndex((e) => e.id === etape);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          ouvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onFermer}
        aria-hidden="true"
      />

      {/* Modal centré */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          ouvert ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Passer commande"
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transition-all duration-300 ${
            ouvert ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
        {/* ── En-tête ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-[#011023]">Passer commande</h2>
          <button
            onClick={onFermer}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Indicateur d'étapes ─────────────────────── */}
        <div className="flex items-center px-6 py-4 gap-1 bg-gray-50 border-b border-gray-100">
          {ETAPES.map((e, i) => (
            <div key={e.id} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                i === indexEtape
                  ? 'bg-[#FC7701] text-white'
                  : i < indexEtape
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-400'
              }`}>
                {e.icone}
                <span className="hidden sm:block">{e.label}</span>
              </div>
              {i < ETAPES.length - 1 && (
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* ── Contenu de l'étape ──────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Erreur */}
          {erreur && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {erreur}
            </div>
          )}

          {/* ── Étape 1 : Adresse ─────────────────────── */}
          {etape === 'adresse' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-5">Où souhaitez-vous être livré ?</p>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={adresse.nomComplet}
                  onChange={(e) => setAdresse((p) => ({ ...p, nomComplet: e.target.value }))}
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={adresse.ville}
                    onChange={(e) => setAdresse((p) => ({ ...p, ville: e.target.value }))}
                    placeholder="Cotonou"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                    Quartier
                  </label>
                  <input
                    type="text"
                    value={adresse.quartier}
                    onChange={(e) => setAdresse((p) => ({ ...p, quartier: e.target.value }))}
                    placeholder="Cadjehoun"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={adresse.telephone}
                  onChange={(e) => setAdresse((p) => ({ ...p, telephone: e.target.value }))}
                  placeholder="+229 97 00 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                  Instructions de livraison
                </label>
                <textarea
                  value={adresse.instructions}
                  onChange={(e) => setAdresse((p) => ({ ...p, instructions: e.target.value }))}
                  placeholder="Bâtiment bleu, 2ème étage, sonner 2 fois..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Étape 2 : Paiement ────────────────────── */}
          {etape === 'paiement' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-5">Comment souhaitez-vous payer ?</p>

              {/* Mobile Money */}
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paiement.methode === 'mobile_money'
                  ? 'border-[#FC7701] bg-[#FC7701]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="methode"
                  value="mobile_money"
                  checked={paiement.methode === 'mobile_money'}
                  onChange={() => setPaiement((p) => ({ ...p, methode: 'mobile_money' }))}
                  className="mt-1 accent-[#FC7701]"
                />
                <div>
                  <p className="font-semibold text-[#011023] text-sm">Mobile Money</p>
                  <p className="text-xs text-gray-400 mt-0.5">MTN, Moov, ou autres opérateurs</p>
                </div>
              </label>

              {paiement.methode === 'mobile_money' && (
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                    Numéro Mobile Money *
                  </label>
                  <input
                    type="tel"
                    value={paiement.numeroMobile}
                    onChange={(e) => setPaiement((p) => ({ ...p, numeroMobile: e.target.value }))}
                    placeholder="+229 97 00 00 00"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
                  />
                </div>
              )}

              {/* Cash à la livraison */}
              <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paiement.methode === 'cash_livraison'
                  ? 'border-[#FC7701] bg-[#FC7701]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="methode"
                  value="cash_livraison"
                  checked={paiement.methode === 'cash_livraison'}
                  onChange={() => setPaiement((p) => ({ ...p, methode: 'cash_livraison', numeroMobile: '' }))}
                  className="mt-1 accent-[#FC7701]"
                />
                <div>
                  <p className="font-semibold text-[#011023] text-sm">Cash à la livraison</p>
                  <p className="text-xs text-gray-400 mt-0.5">Paiement en espèces au moment de la livraison</p>
                </div>
              </label>
            </div>
          )}

          {/* ── Étape 3 : Confirmation ────────────────── */}
          {etape === 'confirmation' && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">Vérifiez vos informations avant de confirmer.</p>

              {/* Résumé adresse */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={15} className="text-[#FC7701]" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Livraison</p>
                </div>
                <p className="text-sm font-semibold text-[#011023]">{adresse.nomComplet}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {[adresse.quartier, adresse.ville].filter(Boolean).join(', ')}
                </p>
                <p className="text-sm text-gray-500">{adresse.telephone}</p>
                {adresse.instructions && (
                  <p className="text-xs text-gray-400 mt-1 italic">"{adresse.instructions}"</p>
                )}
              </div>

              {/* Résumé paiement */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={15} className="text-[#FC7701]" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Paiement</p>
                </div>
                <p className="text-sm font-semibold text-[#011023]">
                  {paiement.methode === 'mobile_money' ? 'Mobile Money' : 'Cash à la livraison'}
                </p>
                {paiement.methode === 'mobile_money' && paiement.numeroMobile && (
                  <p className="text-sm text-gray-500 mt-0.5">{paiement.numeroMobile}</p>
                )}
              </div>

              {/* Résumé commande */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Récapitulatif
                </p>
                <div className="space-y-2 mb-3">
                  {panier?.lignes.map((ligne) => (
                    <div key={ligne._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1 pr-2">
                        {ligne.produit.nom}
                        <span className="text-gray-400 ml-1">× {ligne.quantite}</span>
                      </span>
                      <span className="font-semibold text-[#011023] shrink-0">
                        {formatPrix((ligne.produit.prixPromotionnel ?? ligne.produit.prix) * ligne.quantite)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-[#011023]">Total</span>
                  <span className="font-black text-lg text-[#FC7701]">
                    {formatPrix(panier?.total ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ─────────────────────────────────── */}
        <div className="border-t border-gray-100 px-6 py-5 space-y-3 bg-white">
          {etape !== 'adresse' && (
            <button
              onClick={() => {
                setErreur(null);
                setEtape(etape === 'confirmation' ? 'paiement' : 'adresse');
              }}
              className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          )}

          {etape !== 'confirmation' ? (
            <button
              onClick={passerEtape}
              className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30"
              style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={confirmerCommande}
              disabled={envoi}
              className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FC7701]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(to right, #FC8900, #FC7700)' }}
            >
              {envoi ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Confirmation en cours…
                </>
              ) : (
                <>Confirmer la commande — {formatPrix(panier?.total ?? 0)}</>
              )}
            </button>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
