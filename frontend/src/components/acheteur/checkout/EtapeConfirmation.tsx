import { CreditCard, MapPin, Pencil, Store } from 'lucide-react';
import type { ChampsAdresse, ModeLivraison, OptionsBoutique } from '../../../types/acheteur';
import type { EtapeCheckout, PaiementCheckout } from '../../../hooks/acheteur/useCheckout';
import { formatPrix } from '../commandes/configCommandes';
import { resumerAdresse } from '../adresses/adresseUtils';
import { libelleDelai } from './checkoutUtils';

interface Props {
  adresse: ChampsAdresse;
  boutiques: OptionsBoutique[];
  livraisons: Record<string, ModeLivraison>;
  paiement: PaiementCheckout;
  totaux: { sousTotal: number; frais: number; total: number };
  onModifier: (etape: EtapeCheckout) => void;
}

/** Étape 4 — récapitulatif avant validation, avec frais par boutique. */
export default function EtapeConfirmation({ adresse, boutiques, livraisons, paiement, totaux, onModifier }: Props) {
  return (
    <div className="space-y-4">
      <Resume titre="Adresse" icone={<MapPin size={15} />} onModifier={() => onModifier('adresse')}>
        <p className="text-sm font-semibold text-[#011023]">{adresse.nomComplet}</p>
        <p className="text-sm text-gray-500">{resumerAdresse(adresse)}</p>
        <p className="text-sm text-gray-500">{adresse.telephone}</p>
      </Resume>

      <Resume titre="Paiement" icone={<CreditCard size={15} />} onModifier={() => onModifier('paiement')}>
        <p className="text-sm font-semibold text-[#011023]">
          {paiement.methode === 'mobile_money' ? `Mobile Money · ${paiement.numeroMobile}` : 'Espèces à la remise'}
        </p>
      </Resume>

      <section className="rounded-2xl border border-gray-200">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Vos commandes</p>
          <button type="button" onClick={() => onModifier('livraison')} className="inline-flex items-center gap-1 text-xs font-semibold text-[#FC7701]">
            <Pencil size={12} /> Livraison
          </button>
        </header>

        <ul className="divide-y divide-gray-100">
          {boutiques.map((b) => {
            const mode = livraisons[b.vendeur._id];
            const option = b.options[mode];
            const delai = libelleDelai(option.delaiMin, option.delaiMax);
            return (
              <li key={b.vendeur._id} className="px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Store size={14} className="text-gray-400" />
                  <span className="font-semibold text-[#011023] truncate flex-1">{b.vendeur.nomEntreprise}</span>
                  <span className="tabular-nums text-gray-700">{formatPrix(b.sousTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1 pl-[22px]">
                  <span>
                    {mode === 'retrait' ? `Retrait · ${option.pointRetrait?.ville ?? ''}` : 'Livraison à domicile'}
                    {delai && ` · ${delai}`}
                  </span>
                  <span className={option.frais ? 'tabular-nums' : 'text-emerald-600 font-medium'}>
                    {option.frais ? `+ ${formatPrix(option.frais)}` : 'Gratuit'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <dl className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-sm bg-gray-50/60 rounded-b-2xl">
          <div className="flex justify-between"><dt className="text-gray-500">Articles</dt><dd className="tabular-nums">{formatPrix(totaux.sousTotal)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Livraison</dt>
            <dd className={totaux.frais ? 'tabular-nums' : 'text-emerald-600 font-medium'}>{totaux.frais ? formatPrix(totaux.frais) : 'Gratuite'}</dd>
          </div>
          <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
            <dt className="font-bold text-[#011023]">Total</dt>
            <dd className="font-black text-lg text-[#FC7701] tabular-nums">{formatPrix(totaux.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function Resume({ titre, icone, onModifier, children }: { titre: string; icone: React.ReactNode; onModifier: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
          <span className="text-[#FC7701]">{icone}</span> {titre}
        </p>
        <button type="button" onClick={onModifier} className="inline-flex items-center gap-1 text-xs font-semibold text-[#FC7701]">
          <Pencil size={12} /> Modifier
        </button>
      </div>
      {children}
    </section>
  );
}
