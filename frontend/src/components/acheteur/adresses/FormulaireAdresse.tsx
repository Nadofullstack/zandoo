import type { ChampsAdresse } from '../../../types/acheteur';
import { LIBELLES_SUGGERES } from './adresseUtils';

/**
 * Champs d'une adresse de livraison (contrôlé).
 * Utilisé par la page « Mes adresses » et par le tunnel de commande.
 */

const CHAMP = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/15 transition-colors';
const LABEL = 'text-xs font-semibold text-gray-600 mb-1.5 block';

interface Props {
  valeur: ChampsAdresse;
  onChange: (valeur: ChampsAdresse) => void;
  /** Masque le choix du libellé (Maison, Bureau…) */
  sansLibelle?: boolean;
}

export default function FormulaireAdresse({ valeur, onChange, sansLibelle }: Props) {
  const maj = (champ: keyof ChampsAdresse) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...valeur, [champ]: e.target.value });

  return (
    <div className="space-y-4">
      {!sansLibelle && (
        <div>
          <span className={LABEL}>Nom de l'adresse</span>
          <div className="flex flex-wrap gap-2">
            {LIBELLES_SUGGERES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onChange({ ...valeur, libelle: valeur.libelle === l ? '' : l })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  valeur.libelle === l ? 'border-[#FC7701] bg-orange-50 text-[#FC7701]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {l}
              </button>
            ))}
            <input
              value={LIBELLES_SUGGERES.includes(valeur.libelle ?? '') ? '' : valeur.libelle}
              onChange={maj('libelle')}
              maxLength={40}
              placeholder="Autre…"
              aria-label="Nom personnalisé de l'adresse"
              className="flex-1 min-w-[100px] px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#FC7701]"
            />
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="adr-nom" className={LABEL}>Destinataire *</label>
          <input id="adr-nom" value={valeur.nomComplet} onChange={maj('nomComplet')} maxLength={100} autoComplete="name" placeholder="Prénom et nom" className={CHAMP} />
        </div>
        <div>
          <label htmlFor="adr-tel" className={LABEL}>Téléphone *</label>
          <input id="adr-tel" type="tel" value={valeur.telephone} onChange={maj('telephone')} maxLength={20} autoComplete="tel" placeholder="+229 97 00 00 00" className={CHAMP} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="adr-ville" className={LABEL}>Ville *</label>
          <input id="adr-ville" value={valeur.ville} onChange={maj('ville')} maxLength={100} autoComplete="address-level2" placeholder="Cotonou" className={CHAMP} />
        </div>
        <div>
          <label htmlFor="adr-quartier" className={LABEL}>Quartier</label>
          <input id="adr-quartier" value={valeur.quartier} onChange={maj('quartier')} maxLength={100} placeholder="Cadjèhoun" className={CHAMP} />
        </div>
      </div>

      <div>
        <label htmlFor="adr-rue" className={LABEL}>Rue, repère</label>
        <input id="adr-rue" value={valeur.rue} onChange={maj('rue')} maxLength={200} autoComplete="street-address" placeholder="Rue 12.034, près de la pharmacie…" className={CHAMP} />
      </div>

      <div>
        <label htmlFor="adr-instr" className={LABEL}>Instructions pour le livreur</label>
        <textarea id="adr-instr" value={valeur.instructions} onChange={maj('instructions')} maxLength={300} rows={2} placeholder="Portail bleu, appeler en arrivant…" className={`${CHAMP} resize-none`} />
      </div>
    </div>
  );
}
