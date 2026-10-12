import { Clock, Gift, MapPin, Store, Truck } from 'lucide-react';
import type { ModeLivraison, OptionLivraison, OptionsBoutique } from '../../../types/acheteur';
import { formatPrix } from '../commandes/configCommandes';
import { libelleDelai } from './checkoutUtils';

interface Props {
  ville: string;
  boutiques: OptionsBoutique[];
  livraisons: Record<string, ModeLivraison>;
  onChoisir: (vendeurId: string, mode: ModeLivraison) => void;
}

/**
 * Étape 2 — mode de livraison par boutique.
 * Chaque boutique expédie séparément : un choix et des frais par boutique.
 */
export default function EtapeLivraison({ ville, boutiques, livraisons, onChoisir }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Livraison à <span className="font-semibold text-[#011023]">{ville}</span>
        {boutiques.length > 1 && <> · votre panier contient des articles de {boutiques.length} boutiques, expédiés séparément.</>}
      </p>

      {boutiques.map((b) => {
        const choisi = livraisons[b.vendeur._id];
        const aucun = !b.options.domicile.disponible && !b.options.retrait.disponible;

        return (
          <section key={b.vendeur._id} className="rounded-2xl border border-gray-200 overflow-hidden">
            <header className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
              <Store size={15} className="text-gray-400" />
              <span className="text-sm font-bold text-[#011023] truncate flex-1">{b.vendeur.nomEntreprise}</span>
              <span className="text-xs text-gray-500 shrink-0">
                {b.nombreArticles} article{b.nombreArticles > 1 ? 's' : ''} · {formatPrix(b.sousTotal)}
              </span>
            </header>

            <div role="radiogroup" aria-label={`Livraison ${b.vendeur.nomEntreprise}`} className="p-3 space-y-2">
              {aucun ? (
                <p className="px-2 py-3 text-sm text-red-600">{b.options.domicile.raison}</p>
              ) : (
                <>
                  <Option
                    mode="domicile"
                    option={b.options.domicile}
                    actif={choisi === 'domicile'}
                    onChoisir={() => onChoisir(b.vendeur._id, 'domicile')}
                  />
                  {b.options.retrait.disponible && (
                    <Option
                      mode="retrait"
                      option={b.options.retrait}
                      actif={choisi === 'retrait'}
                      onChoisir={() => onChoisir(b.vendeur._id, 'retrait')}
                    />
                  )}
                </>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Option({ mode, option, actif, onChoisir }: { mode: ModeLivraison; option: OptionLivraison; actif: boolean; onChoisir: () => void }) {
  const domicile = mode === 'domicile';
  const delai = libelleDelai(option.delaiMin, option.delaiMax);

  if (!option.disponible) {
    return (
      <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-gray-50 opacity-70">
        <Truck size={18} className="text-gray-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-500">Livraison à domicile</p>
          <p className="text-xs text-gray-500">{option.raison}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={actif}
      onClick={onChoisir}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl border-2 text-left transition-all ${
        actif ? 'border-[#FC7701] bg-orange-50/40' : 'border-transparent bg-white hover:bg-gray-50'
      }`}
    >
      <span className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${actif ? 'border-[#FC7701]' : 'border-gray-300'}`}>
        {actif && <span className="w-2 h-2 rounded-full bg-[#FC7701]" />}
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#011023]">
          {domicile ? <Truck size={16} className="text-gray-500" /> : <MapPin size={16} className="text-gray-500" />}
          {domicile ? 'Livraison à domicile' : 'Retrait en boutique'}
        </span>

        {domicile ? (
          <span className="block text-xs text-gray-500 mt-1">
            {delai && <span className="inline-flex items-center gap-1"><Clock size={11} /> {delai}</span>}
            {option.zone && <span className="text-gray-400">{delai ? ' · ' : ''}{option.zone}</span>}
          </span>
        ) : (
          option.pointRetrait && (
            <span className="block text-xs text-gray-500 mt-1">
              {option.pointRetrait.adresse}, {option.pointRetrait.ville}
              {option.pointRetrait.horaires && <span className="block text-gray-400">{option.pointRetrait.horaires}</span>}
            </span>
          )
        )}

        {option.resteAvantGratuite ? (
          <span className="flex items-center gap-1 text-xs text-emerald-700 mt-1.5">
            <Gift size={12} /> Plus que {formatPrix(option.resteAvantGratuite)} d'achats dans cette boutique pour la livraison offerte
          </span>
        ) : null}
      </span>

      <span className={`text-sm font-bold shrink-0 ${option.frais ? 'text-[#011023]' : 'text-emerald-600'}`}>
        {option.frais ? formatPrix(option.frais) : 'Gratuit'}
      </span>
    </button>
  );
}
