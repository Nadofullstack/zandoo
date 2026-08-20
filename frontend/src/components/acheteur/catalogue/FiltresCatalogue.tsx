import { useEffect, useState } from 'react';
import { SlidersHorizontal, LayoutGrid } from 'lucide-react';
import type { TriCatalogue, CategorieResumee } from '../../../types/acheteur';
import { getCategories } from '../../../services/acheteur/acheteurCatalogueService';

interface Props {
  tri: TriCatalogue;
  prixMin: string;
  prixMax: string;
  categorieActive?: string;
  onChangeTri: (tri: TriCatalogue) => void;
  onChangePrix: (min: string, max: string) => void;
  onChangeCategorie: (slug: string) => void;
}

const OPTIONS_TRI: { valeur: TriCatalogue; libelle: string }[] = [
  { valeur: 'recent',    libelle: 'Plus récents' },
  { valeur: 'prix_asc',  libelle: 'Prix croissant' },
  { valeur: 'prix_desc', libelle: 'Prix décroissant' },
  { valeur: 'nom_asc',   libelle: 'Nom A → Z' },
];

export default function FiltresCatalogue({
  tri, prixMin, prixMax, categorieActive = '',
  onChangeTri, onChangePrix, onChangeCategorie,
}: Props) {
  const [categories, setCategories] = useState<CategorieResumee[]>([]);
  const [chargCat, setChargCat] = useState(true);

  useEffect(() => {
    getCategories()
      .then((r) => setCategories(r.data.categories ?? []))
      .catch(() => {})
      .finally(() => setChargCat(false));
  }, []);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">

      {/* Titre */}
      <div className="flex items-center gap-2 px-1">
        <SlidersHorizontal size={16} className="text-[#011023]" />
        <span className="font-bold text-[#011023] text-sm">Filtres</span>
      </div>

      {/* Catégories */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#011023] text-sm mb-3">Catégories</h3>

        {chargCat ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Option "Toutes" */}
            <button
              type="button"
              onClick={() => onChangeCategorie('')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full ${
                !categorieActive
                  ? 'bg-[#011023] text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#011023]'
              }`}
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-base leading-none">
                <LayoutGrid size={14} />
              </span>
              Toutes
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => onChangeCategorie(cat._id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full ${
                  categorieActive === cat._id
                    ? 'bg-[#FC7701] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#011023]'
                }`}
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-base leading-none">
                  {cat.icone ?? <LayoutGrid size={14} />}
                </span>
                <span className="truncate">{cat.nom}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tri */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#011023] text-sm mb-4">Trier par</h3>
        <div className="space-y-2.5">
          {OPTIONS_TRI.map((opt) => (
            <label key={opt.valeur} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  tri === opt.valeur
                    ? 'border-[#FC7701] bg-[#FC7701]'
                    : 'border-gray-300 group-hover:border-[#FC7701]/50'
                }`}
              >
                {tri === opt.valeur && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span className={`text-sm transition-colors ${
                tri === opt.valeur ? 'text-[#011023] font-semibold' : 'text-gray-500 group-hover:text-[#011023]'
              }`}>
                {opt.libelle}
              </span>
              <input
                type="radio"
                name="tri"
                value={opt.valeur}
                checked={tri === opt.valeur}
                onChange={() => onChangeTri(opt.valeur)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#011023] text-sm mb-4">Prix (FCFA)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={prixMin}
            min={0}
            onChange={(e) => onChangePrix(e.target.value, prixMax)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
          />
          <span className="text-gray-300 text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={prixMax}
            min={0}
            onChange={(e) => onChangePrix(prixMin, e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#FC7701] transition-colors"
          />
        </div>
      </div>
    </aside>
  );
}
