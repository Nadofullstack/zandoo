import { Tag, ImageOff, LayoutGrid } from 'lucide-react';
import DispositionAdmin from '../../../components/admin/layout/DispositionAdmin';
import Alert from '../../../components/ui/Alert';
import { useGestionCategories } from '../../../hooks/admin/useGestionCategories';
import type { Categorie } from '../../../types/admin';

export default function GestionCategoriesAdmin() {
  const { categories, chargement, erreur } = useGestionCategories();

  /* Aplatir toutes les catégories (racines + sous) pour la grille */
  const toutes: Categorie[] = categories.flatMap((c) => [
    c,
    ...(c.sousCategories ?? []),
  ]);

  return (
    <DispositionAdmin>

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-primary">Catégories</h1>
        <p className="text-sm text-[#74777d] mt-1">
          {toutes.length > 0
            ? `${toutes.length} catégorie${toutes.length > 1 ? 's' : ''} — gérées par les vendeurs.`
            : 'Aucune catégorie — elles sont créées par les vendeurs.'}
        </p>
      </div>

      {erreur && <div className="mb-4"><Alert variant="error">{erreur}</Alert></div>}

      {/* Squelettes */}
      {chargement && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-48" />
          ))}
        </div>
      )}

      {/* Grille de catégories */}
      {!chargement && toutes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {toutes.map((cat) => (
            <CarteCategorie key={cat._id} categorie={cat} />
          ))}
        </div>
      )}

      {/* État vide */}
      {!chargement && toutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
            <LayoutGrid size={36} className="text-gray-300" />
          </div>
          <p className="text-lg font-bold text-primary">Aucune catégorie</p>
          <p className="text-sm text-[#74777d] text-center max-w-xs">
            Les catégories sont créées et gérées par les vendeurs depuis leur espace.
          </p>
        </div>
      )}

    </DispositionAdmin>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Carte catégorie (lecture seule)
───────────────────────────────────────────────────────────────────────── */
function CarteCategorie({ categorie }: { categorie: Categorie }) {
  const estSousCategorie = !!categorie.parent;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-200/80 transition-all duration-300 overflow-hidden flex flex-col">

      {/* Image ou placeholder */}
      <div className="relative aspect-video bg-gray-50 overflow-hidden">
        {categorie.image ? (
          <img
            src={categorie.image}
            alt={categorie.nom}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={32} className="text-gray-300" />
          </div>
        )}

        {/* Badge sous-catégorie */}
        {estSousCategorie && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#74777d] px-2 py-0.5 rounded-full border border-gray-200">
            Sous-catégorie
          </div>
        )}

        {/* Badge inactif */}
        {!categorie.active && (
          <div className="absolute top-2 right-2 bg-gray-800/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Inactif
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-primary leading-snug line-clamp-1">{categorie.nom}</h3>
          <Tag size={14} className="text-accent flex-shrink-0 mt-0.5" />
        </div>

        {categorie.description && (
          <p className="text-xs text-[#74777d] mt-1 line-clamp-2 leading-relaxed">{categorie.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 mt-2">
          <span className="text-[10px] font-mono text-gray-400 truncate">/{categorie.slug}</span>
          {(categorie.sousCategories?.length ?? 0) > 0 && (
            <span className="text-[10px] font-semibold text-accent bg-orange-50 px-1.5 py-0.5 rounded-full">
              {categorie.sousCategories!.length} sous
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
