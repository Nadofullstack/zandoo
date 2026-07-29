import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination } from '../../../types/acheteur';

interface Props {
  pagination: Pagination;
  onChangerPage: (page: number) => void;
}

export default function PaginationCatalogue({ pagination, onChangerPage }: Props) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const debut = Math.max(1, page - 2);
  const fin   = Math.min(totalPages, page + 2);
  const pages = Array.from({ length: fin - debut + 1 }, (_, i) => debut + i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onChangerPage(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} />
      </button>

      {debut > 1 && (
        <>
          <button
            onClick={() => onChangerPage(1)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-sm hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
          >
            1
          </button>
          {debut > 2 && <span className="text-gray-400 px-1 text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChangerPage(p)}
          className={`w-9 h-9 rounded-xl border text-sm font-medium transition-all ${
            p === page
              ? 'bg-[#011023] text-white border-[#011023]'
              : 'border-gray-200 bg-white hover:border-[#FC7701] hover:text-[#FC7701]'
          }`}
        >
          {p}
        </button>
      ))}

      {fin < totalPages && (
        <>
          {fin < totalPages - 1 && <span className="text-gray-400 px-1 text-sm">…</span>}
          <button
            onClick={() => onChangerPage(totalPages)}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-white text-sm hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onChangerPage(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
        aria-label="Page suivante"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
