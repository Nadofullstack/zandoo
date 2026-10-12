import { Package } from 'lucide-react';
import type { LigneCommande } from '../../../types/acheteur';

/** Photo d'une ligne : snapshot pris à la commande, sinon photo actuelle du produit. */
const photoLigne = (ligne: LigneCommande): string | null =>
  ligne.photoProduit || (typeof ligne.produit === 'object' ? ligne.produit?.photoCouverture ?? null : null);

export default function VignetteProduit({ ligne, taille = 'md' }: { ligne: LigneCommande; taille?: 'sm' | 'md' }) {
  const photo = photoLigne(ligne);
  const dimension = taille === 'sm' ? 'w-12 h-12' : 'w-16 h-16';

  return (
    <div className={`${dimension} shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center`}>
      {photo ? (
        <img src={photo} alt={ligne.nomProduit} loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <Package size={taille === 'sm' ? 18 : 22} className="text-gray-300" />
      )}
    </div>
  );
}
