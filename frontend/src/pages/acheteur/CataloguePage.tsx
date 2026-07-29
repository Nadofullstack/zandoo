import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import FiltresCatalogue from '../../components/acheteur/catalogue/FiltresCatalogue';
import GrilleProduits from '../../components/acheteur/catalogue/GrilleProduits';
import PaginationCatalogue from '../../components/acheteur/catalogue/PaginationCatalogue';
import { useCatalogue } from '../../hooks/acheteur/useCatalogue';
import type { TriCatalogue } from '../../types/acheteur';

export default function CataloguePage() {
  const [searchParams] = useSearchParams();
  const { produits, pagination, chargement, erreur, filtre, setFiltre } = useCatalogue();

  /* Sync params URL → filtres au montage */
  useEffect(() => {
    const q   = searchParams.get('q') ?? '';
    const cat = searchParams.get('categorie') ?? '';
    if (q || cat) setFiltre({ recherche: q, categorie: cat });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AcheteurLayout>
      <div className="bg-[#F8F9FF] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10">

          {/* En-tête */}
          <div className="mb-8">
            <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-1">
              {filtre.recherche ? 'Résultats de recherche' : 'Catalogue'}
            </p>
            <h1 className="text-3xl font-black text-[#011023]">
              {filtre.recherche
                ? `"${filtre.recherche}"`
                : 'Tous les produits'}
            </h1>
            {pagination && (
              <p className="text-gray-400 mt-1 text-sm flex items-center gap-1.5">
                <SlidersHorizontal size={14} />
                {pagination.total} produit(s) trouvé(s)
              </p>
            )}
          </div>

          {/* Contenu : filtres + grille */}
          <div className="flex gap-8 items-start">
            <FiltresCatalogue
              tri={filtre.tri}
              prixMin={filtre.prixMin}
              prixMax={filtre.prixMax}
              onChangeTri={(tri: TriCatalogue) => setFiltre({ tri, page: 1 })}
              onChangePrix={(min, max) => setFiltre({ prixMin: min, prixMax: max, page: 1 })}
            />

            <div className="flex-1">
              <GrilleProduits produits={produits} chargement={chargement} erreur={erreur} />
              {pagination && (
                <PaginationCatalogue
                  pagination={pagination}
                  onChangerPage={(page) => setFiltre({ page })}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AcheteurLayout>
  );
}
