import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Heart, RefreshCw } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import CarteProduit from '../../components/acheteur/accueil/CarteProduit';
import PaginationCatalogue from '../../components/acheteur/catalogue/PaginationCatalogue';
import { useFavoris } from '../../context/FavorisContext';
import { getMesFavoris } from '../../services/acheteur/acheteurFavoriService';
import type { Pagination, ProduitFavori } from '../../types/acheteur';

const PAR_PAGE = 24;

/** Page « Mes favoris » : produits mis de côté par l'acheteur. */
export default function MesFavorisPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const { estFavori } = useFavoris();

  const [produits, setProduits]     = useState<ProduitFavori[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [version, setVersion]       = useState(0);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await getMesFavoris(page, PAR_PAGE);
        if (annule) return;
        setProduits(data.produits);
        setPagination(data.pagination);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger vos favoris.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [page, version]);

  /* Un produit retiré depuis cette page disparaît aussitôt, sans rechargement */
  const visibles = produits.filter((p) => estFavori(p._id));

  return (
    <AcheteurLayout>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Link to="/mon-compte" className="hover:text-[#FC7701]">Mon compte</Link>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">Mes favoris</span>
        </nav>
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#011023]">Mes favoris</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination?.total ? `${pagination.total} produit${pagination.total > 1 ? 's' : ''} mis de côté` : 'Retrouvez les produits que vous aimez.'}
          </p>
        </header>

        {erreur ? (
          <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-600">{erreur}</p>
            <button onClick={() => setVersion((v) => v + 1)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">
              <RefreshCw size={14} /> Réessayer
            </button>
          </div>
        ) : chargement && produits.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
          </div>
        ) : visibles.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4"><Heart size={22} className="text-red-500" /></div>
            <h2 className="text-base font-bold text-[#011023]">Aucun favori pour le moment</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Touchez le cœur d'un produit pour le retrouver ici plus tard.</p>
            <Link to="/catalogue" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900]">
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 transition-opacity ${chargement ? 'opacity-60' : ''}`}>
              {visibles.map((p) => <CarteProduit key={p._id} produit={p} />)}
            </div>
            {pagination && (
              <PaginationCatalogue
                pagination={pagination}
                onChangerPage={(p) => setParams(p > 1 ? { page: String(p) } : {})}
              />
            )}
          </>
        )}
      </div>
    </AcheteurLayout>
  );
}
