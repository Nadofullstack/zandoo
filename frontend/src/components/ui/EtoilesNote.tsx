import { Star } from 'lucide-react';

interface Props {
  note: number;           // 0 à 5, décimales acceptées
  taille?: number;
  className?: string;
}

/** Affichage en lecture seule d'une note sur 5 (étoiles partiellement remplies). */
export default function EtoilesNote({ note, taille = 14, className = '' }: Props) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Note : ${note.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const remplissage = Math.max(0, Math.min(1, note - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: taille, height: taille }}>
            <Star size={taille} className="absolute inset-0 text-gray-200 fill-gray-200" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${remplissage * 100}%` }}>
              <Star size={taille} className="text-amber-400 fill-amber-400" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
