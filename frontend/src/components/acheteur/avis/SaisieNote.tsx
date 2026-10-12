import { useState } from 'react';
import { Star } from 'lucide-react';

const LIBELLES = ['', 'Très décevant', 'Décevant', 'Correct', 'Bien', 'Excellent'];

interface Props {
  valeur: number;          // 0 = pas encore noté
  onChange: (note: number) => void;
}

/** Sélection d'une note de 1 à 5 étoiles (souris, tactile et clavier). */
export default function SaisieNote({ valeur, onChange }: Props) {
  const [survol, setSurvol] = useState(0);
  const affichee = survol || valeur;

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Note sur 5" className="flex items-center gap-1" onMouseLeave={() => setSurvol(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valeur === n}
            aria-label={`${n} étoile${n > 1 ? 's' : ''} — ${LIBELLES[n]}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setSurvol(n)}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#FC7701] rounded"
          >
            <Star size={30} className={n <= affichee ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-600 min-w-[100px]">{LIBELLES[affichee]}</span>
    </div>
  );
}
