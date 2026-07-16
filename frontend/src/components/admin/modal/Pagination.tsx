import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limite: number;
  onChangerPage: (page: number) => void;
}

/**
 * Contrôles de pagination avec info sur les résultats affichés.
 */
export default function Pagination({
  page,
  totalPages,
  total,
  limite,
  onChangerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const debut = (page - 1) * limite + 1;
  const fin   = Math.min(page * limite, total);

  return (
    <div className="flex items-center justify-between px-1 mt-4">
      <p className="text-xs text-[#74777d]">
        {debut}–{fin} sur {total.toLocaleString('fr-FR')} résultats
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChangerPage(page - 1)}
          disabled={page <= 1}
          aria-label="Page précédente"
          className="p-1.5 rounded-lg border border-[#c4c6cd] text-[#74777d] hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-3 py-1.5 text-sm font-semibold text-primary">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onChangerPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Page suivante"
          className="p-1.5 rounded-lg border border-[#c4c6cd] text-[#74777d] hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
