import type { ResumeNotes as Resume } from '../../../types/acheteur';
import EtoilesNote from '../../ui/EtoilesNote';

interface Props {
  resume: Resume;
  /** Note filtrée actuellement (barre mise en avant) */
  noteFiltre?: number;
  onFiltrer?: (note: number | undefined) => void;
}

/** Note moyenne + répartition par étoiles ; chaque barre filtre la liste. */
export default function ResumeNotes({ resume, noteFiltre, onFiltrer }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
      <div className="text-center sm:pr-6 sm:border-r border-gray-100 shrink-0">
        <p className="text-5xl font-black text-[#011023] tabular-nums">
          {resume.moyenne.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </p>
        <EtoilesNote note={resume.moyenne} taille={18} className="mt-1" />
        <p className="text-xs text-gray-500 mt-1">{resume.total} avis</p>
      </div>

      <ul className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const nb = resume.repartition[n] ?? 0;
          const part = resume.total ? (nb / resume.total) * 100 : 0;
          const actif = noteFiltre === n;
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onFiltrer?.(actif ? undefined : n)}
                disabled={!onFiltrer || nb === 0}
                aria-pressed={actif}
                className={`w-full flex items-center gap-3 px-2 py-1 rounded-lg text-sm transition-colors disabled:cursor-default ${
                  actif ? 'bg-amber-50' : 'enabled:hover:bg-gray-50'
                }`}
              >
                <span className="w-8 text-gray-600 tabular-nums">{n} ★</span>
                <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <span className="block h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: `${part}%` }} />
                </span>
                <span className="w-8 text-right text-xs text-gray-500 tabular-nums">{nb}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
