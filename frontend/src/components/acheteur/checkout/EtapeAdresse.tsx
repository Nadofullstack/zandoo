import { Plus } from 'lucide-react';
import type { AdresseEnregistree } from '../../../types/acheteur';
import type { ChoixAdresse } from '../../../hooks/acheteur/useCheckout';
import CarteAdresse from '../adresses/CarteAdresse';
import FormulaireAdresse from '../adresses/FormulaireAdresse';
import { ADRESSE_VIDE } from '../adresses/adresseUtils';

interface Props {
  adresses: AdresseEnregistree[];
  chargement: boolean;
  choix: ChoixAdresse | null;
  onChoisir: (choix: ChoixAdresse) => void;
  nomParDefaut?: string;
  telephoneParDefaut?: string;
}

/** Étape 1 — choix d'une adresse enregistrée ou saisie d'une nouvelle. */
export default function EtapeAdresse({ adresses, chargement, choix, onChoisir, nomParDefaut = '', telephoneParDefaut = '' }: Props) {
  if (chargement || !choix) {
    return <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}</div>;
  }

  const nouvelle = choix.type === 'nouvelle' ? choix : null;
  const nouvelleVide: ChoixAdresse = {
    type: 'nouvelle',
    champs: { ...ADRESSE_VIDE, nomComplet: nomParDefaut, telephone: telephoneParDefaut },
    enregistrer: true,
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Où souhaitez-vous être livré ?</p>

      {adresses.length > 0 && (
        <div role="radiogroup" aria-label="Adresses enregistrées" className="space-y-2.5">
          {adresses.map((a) => (
            <CarteAdresse
              key={a._id}
              adresse={a}
              selectionnee={choix.type === 'enregistree' && choix.id === a._id}
              onSelectionner={() => onChoisir({ type: 'enregistree', id: a._id })}
            />
          ))}

          {!nouvelle && (
            <button
              type="button"
              onClick={() => onChoisir(nouvelleVide)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-600 hover:border-[#FC7701] hover:text-[#FC7701] transition-colors"
            >
              <Plus size={16} /> Utiliser une autre adresse
            </button>
          )}
        </div>
      )}

      {nouvelle && (
        <div className={adresses.length > 0 ? 'rounded-2xl border border-[#FC7701]/40 p-4 bg-orange-50/20' : ''}>
          {adresses.length > 0 && <p className="text-sm font-bold text-[#011023] mb-4">Nouvelle adresse</p>}
          <FormulaireAdresse
            valeur={nouvelle.champs}
            onChange={(champs) => onChoisir({ ...nouvelle, champs })}
            sansLibelle={!nouvelle.enregistrer}
          />
          <label className="mt-4 flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={nouvelle.enregistrer}
              onChange={(e) => onChoisir({ ...nouvelle, enregistrer: e.target.checked })}
              className="w-4 h-4 accent-[#FC7701]"
            />
            Enregistrer cette adresse pour mes prochaines commandes
          </label>
        </div>
      )}
    </div>
  );
}
