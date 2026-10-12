import { Check, X } from 'lucide-react';
import type { EtapeSuivi } from '../../../types/acheteur';
import { formatDateHeure } from './configCommandes';

/**
 * Frise de suivi d'une commande.
 * Verticale sur mobile, horizontale à partir de `md`.
 * Les étapes sont calculées par l'API (`suivi`) : ce composant ne fait qu'afficher.
 */
export default function SuiviCommande({ etapes }: { etapes: EtapeSuivi[] }) {
  return (
    <ol className="flex flex-col md:flex-row md:items-start">
      {etapes.map((etape, i) => {
        const derniere = i === etapes.length - 1;
        const suivanteAtteinte = !derniere && etapes[i + 1].etat !== 'a_venir';

        return (
          <li key={etape.statut} className="relative flex md:flex-col md:items-center md:flex-1 gap-4 md:gap-3 pb-6 md:pb-0">
            {/* Connecteur vers l'étape suivante */}
            {!derniere && (
              <span
                aria-hidden="true"
                className={`absolute left-[15px] top-8 bottom-0 w-0.5 md:left-[calc(50%+20px)] md:right-[calc(-50%+20px)] md:top-[15px] md:bottom-auto md:w-auto md:h-0.5 ${
                  suivanteAtteinte ? 'bg-[#FC7701]' : 'bg-gray-200'
                }`}
              />
            )}

            <Pastille etat={etape.etat} index={i} />

            <div className="md:text-center min-w-0">
              <p className={`text-sm font-semibold ${
                etape.etat === 'a_venir' ? 'text-gray-400'
                  : etape.etat === 'annulee' ? 'text-red-600'
                  : 'text-[#011023]'
              }`}>
                {etape.libelle}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {etape.date ? formatDateHeure(etape.date) : etape.etat === 'actuelle' ? 'En cours' : ' '}
              </p>
              {etape.raison && <p className="text-xs text-gray-500 mt-1 italic md:max-w-[160px]">« {etape.raison} »</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Pastille({ etat, index }: { etat: EtapeSuivi['etat']; index: number }) {
  const base = 'relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors';

  if (etat === 'terminee') {
    return <span className={`${base} bg-[#FC7701] text-white`}><Check size={16} strokeWidth={3} /></span>;
  }
  if (etat === 'annulee') {
    return <span className={`${base} bg-red-500 text-white`}><X size={16} strokeWidth={3} /></span>;
  }
  if (etat === 'actuelle') {
    return (
      <span className={`${base} bg-white text-[#FC7701] ring-2 ring-[#FC7701]`}>
        <span className="absolute inset-0 rounded-full ring-4 ring-[#FC7701]/20 animate-pulse" />
        {index + 1}
      </span>
    );
  }
  return <span className={`${base} bg-white text-gray-400 ring-2 ring-gray-200`}>{index + 1}</span>;
}
