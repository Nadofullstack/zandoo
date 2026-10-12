import { Banknote, Smartphone } from 'lucide-react';
import type { PaiementCheckout } from '../../../hooks/acheteur/useCheckout';

interface Props {
  paiement: PaiementCheckout;
  onChange: (paiement: PaiementCheckout) => void;
  /** true si au moins une boutique est en retrait : libellé adapté du paiement à la remise */
  contientRetrait: boolean;
}

/** Étape 3 — moyen de paiement. */
export default function EtapePaiement({ paiement, onChange, contientRetrait }: Props) {
  const METHODES = [
    {
      valeur: 'mobile_money' as const,
      titre: 'Mobile Money',
      detail: 'MTN MoMo, Moov Money, Celtiis Cash',
      icone: <Smartphone size={18} className="text-gray-500" />,
    },
    {
      valeur: 'especes' as const,
      titre: contientRetrait ? 'Espèces à la remise' : 'Paiement à la livraison',
      detail: contientRetrait ? 'Payez en espèces à la livraison ou au retrait' : 'Payez en espèces à la réception du colis',
      icone: <Banknote size={18} className="text-gray-500" />,
    },
  ];

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Moyen de paiement">
      <p className="text-sm text-gray-500 mb-2">Comment souhaitez-vous payer ?</p>

      {METHODES.map((m) => {
        const actif = paiement.methode === m.valeur;
        return (
          <div key={m.valeur}>
            <button
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => onChange({ methode: m.valeur, numeroMobile: m.valeur === 'mobile_money' ? paiement.numeroMobile : '' })}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                actif ? 'border-[#FC7701] bg-orange-50/40' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${actif ? 'border-[#FC7701]' : 'border-gray-300'}`}>
                {actif && <span className="w-2 h-2 rounded-full bg-[#FC7701]" />}
              </span>
              {m.icone}
              <span>
                <span className="block text-sm font-semibold text-[#011023]">{m.titre}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{m.detail}</span>
              </span>
            </button>

            {actif && m.valeur === 'mobile_money' && (
              <div className="mt-2 pl-4">
                <label htmlFor="numero-momo" className="text-xs font-semibold text-gray-600 mb-1.5 block">Numéro Mobile Money *</label>
                <input
                  id="numero-momo"
                  type="tel"
                  autoFocus
                  value={paiement.numeroMobile}
                  onChange={(e) => onChange({ ...paiement, numeroMobile: e.target.value })}
                  placeholder="+229 97 00 00 00"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/15"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
