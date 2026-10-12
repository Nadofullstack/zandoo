import { Briefcase, Home, MapPin, Phone } from 'lucide-react';
import type { AdresseEnregistree } from '../../../types/acheteur';
import { resumerAdresse } from './adresseUtils';

const ICONES: Record<string, React.ReactNode> = {
  Maison: <Home size={15} />,
  Bureau: <Briefcase size={15} />,
};

interface Props {
  adresse: AdresseEnregistree;
  /** Zone d'actions (boutons) affichée en pied de carte */
  actions?: React.ReactNode;
  /** Mode sélection (tunnel de commande) */
  selectionnee?: boolean;
  onSelectionner?: () => void;
}

/** Affichage d'une adresse enregistrée — en liste ou en sélection. */
export default function CarteAdresse({ adresse, actions, selectionnee, onSelectionner }: Props) {
  const selectionnable = !!onSelectionner;

  const contenu = (
    <>
      <div className="flex items-center gap-2 mb-2">
        {selectionnable && (
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectionnee ? 'border-[#FC7701]' : 'border-gray-300'}`}>
            {selectionnee && <span className="w-2 h-2 rounded-full bg-[#FC7701]" />}
          </span>
        )}
        <span className="text-gray-400">{ICONES[adresse.libelle ?? ''] ?? <MapPin size={15} />}</span>
        <span className="text-sm font-bold text-[#011023] truncate">{adresse.libelle || adresse.ville}</span>
        {adresse.parDefaut && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#FC7701] bg-orange-50 px-2 py-0.5 rounded-full">
            Par défaut
          </span>
        )}
      </div>
      <p className="text-sm text-gray-800">{adresse.nomComplet}</p>
      <p className="text-sm text-gray-500">{resumerAdresse(adresse)}</p>
      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><Phone size={12} /> {adresse.telephone}</p>
      {adresse.instructions && <p className="text-xs text-gray-400 italic mt-1.5 line-clamp-2">« {adresse.instructions} »</p>}
    </>
  );

  const classes = `w-full text-left rounded-2xl border p-4 transition-all ${
    selectionnee ? 'border-[#FC7701] ring-2 ring-[#FC7701]/15 bg-orange-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;

  if (selectionnable) {
    return (
      <button type="button" role="radio" aria-checked={selectionnee} onClick={onSelectionner} className={classes}>
        {contenu}
      </button>
    );
  }

  return (
    <article className={`${classes} flex flex-col`}>
      <div className="flex-1">{contenu}</div>
      {actions && <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">{actions}</div>}
    </article>
  );
}
