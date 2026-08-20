import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import type { CategorieResumee } from '../../../types/acheteur';

interface Props {
  categories: CategorieResumee[];
  chargement: boolean;
  /** En mode sidebar, pas de padding/section wrapper */
  mode?: 'sidebar' | 'section';
}

export default function SectionCategories({ categories, chargement, mode = 'sidebar' }: Props) {
  const contenu = (
    <div>
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-base font-black text-[#011023] leading-tight">Catégories</h2>
        <Link
          to="/catalogue"
          className="flex items-center gap-1 text-xs font-semibold text-[#FC7701] hover:gap-2 transition-all"
        >
          Tout voir <ArrowRight size={13} />
        </Link>
      </div>

      {/* Squelettes */}
      {chargement && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-11 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Liste verticale icône + nom */}
      {!chargement && (
        <div className="flex flex-col gap-1.5">
          {categories.slice(0, 20).map((cat) => (
            <Link
              key={cat._id}
              to={`/catalogue/categorie/${cat.slug}`}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-[#FC7701]/40 hover:bg-[#FFF7ED] transition-all bg-white"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F1F5F9] group-hover:bg-[#FC7701]/10 transition-colors shrink-0 text-lg leading-none">
                {cat.icone ? (
                  <span role="img" aria-label={cat.nom}>{cat.icone}</span>
                ) : (
                  <LayoutGrid size={15} className="text-[#011023]" />
                )}
              </div>
              <span className="text-sm font-semibold text-[#011023] group-hover:text-[#FC7701] transition-colors truncate">
                {cat.nom}
              </span>
              <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-[#FC7701] transition-colors shrink-0" />
            </Link>
          ))}

          {/* Tout voir */}
          {categories.length > 0 && (
            <Link
              to="/catalogue"
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-[#FC7701]/30 hover:border-[#FC7701] hover:bg-[#FFF7ED] transition-all mt-0.5"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FFF7ED] group-hover:bg-[#FC7701]/20 transition-colors shrink-0">
                <LayoutGrid size={15} className="text-[#FC7701]" />
              </div>
              <span className="text-sm font-semibold text-[#FC7701] truncate">Toutes les catégories</span>
              <ArrowRight size={13} className="ml-auto text-[#FC7701]/50 group-hover:text-[#FC7701] transition-colors shrink-0" />
            </Link>
          )}
        </div>
      )}
    </div>
  );

  if (mode === 'sidebar') {
    return <div className="sticky top-4">{contenu}</div>;
  }

  /* mode section — utilisé sur mobile */
  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">Catalogue</p>
        {contenu}
      </div>
    </section>
  );
}
