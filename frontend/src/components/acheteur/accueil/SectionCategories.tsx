import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import type { CategorieResumee } from '../../../types/acheteur';

interface Props {
  categories: CategorieResumee[];
  chargement: boolean;
}

export default function SectionCategories({ categories, chargement }: Props) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

        {/* En-tête */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">Catalogue</p>
            <h2 className="text-3xl font-black text-[#011023] leading-tight">
              Parcourir par catégorie
            </h2>
          </div>
          <Link
            to="/catalogue"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#FC7701] hover:gap-2 transition-all"
          >
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>

        {/* Squelettes */}
        {chargement && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {/* Catégories dynamiques */}
        {!chargement && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 9).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/catalogue/categorie/${cat.slug}`}
                  className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-lg hover:shadow-gray-200/80 transition-all bg-white"
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#F1F5F9] transition-transform group-hover:scale-110">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.nom} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <LayoutGrid size={26} style={{ color: '#011023' }} />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[#011023] text-center group-hover:text-[#FC7701] transition-colors">
                    {cat.nom}
                  </span>
                </Link>
              ))}

            {/* Tuile "Tout voir" */}
            {categories.length > 0 && (
              <Link
                to="/catalogue"
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-[#FC7701]/30 hover:border-[#FC7701] hover:bg-[#FFF7ED] transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-[#FFF7ED] group-hover:bg-[#FC7701]/20 flex items-center justify-center transition-all">
                  <LayoutGrid size={26} className="text-[#FC7701]" />
                </div>
                <span className="text-sm font-semibold text-[#FC7701] text-center">
                  Toutes les catégories
                </span>
              </Link>
            )}

          </div>
        )}
      </div>
    </section>
  );
}
