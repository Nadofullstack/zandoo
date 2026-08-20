import { AlertCircle, SearchX } from 'lucide-react';
import type { ProduitResume } from '../../../types/acheteur';
import CarteProduit from '../accueil/CarteProduit';

interface Props {
  produits: ProduitResume[];
  chargement: boolean;
  erreur: string | null;
}

export default function GrilleProduits({ produits, chargement, erreur }: Props) {
  if (erreur) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">{erreur}</p>
        </div>
      </div>
    );
  }

  if (chargement) {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="aspect-square bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-100 animate-pulse rounded w-1/3" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
              <div className="h-5 bg-gray-100 animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!produits.length) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <SearchX size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Aucun produit trouvé.</p>
          <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {produits.map((produit) => (
        <CarteProduit key={produit._id} produit={produit} />
      ))}
    </div>
  );
}
