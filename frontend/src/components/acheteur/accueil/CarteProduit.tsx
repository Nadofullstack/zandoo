import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ImageOff } from 'lucide-react';
import type { ProduitResume } from '../../../types/acheteur';
import { usePanier } from '../../../context/PanierContext';

interface Props {
  produit: ProduitResume;
}

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' FCFA';
}

export default function CarteProduit({ produit }: Props) {
  const { ajouterAuPanier } = usePanier();

  const photo       = produit.photoCouverture ?? produit.variantesPhotos?.[0]?.photos?.[0] ?? '';
  const prixAffiche = produit.prixPromotionnel ?? produit.prix;
  const aPromotion  = !!produit.prixPromotionnel && produit.prixPromotionnel < produit.prix;
  const remise      = aPromotion
    ? Math.round(((produit.prix - prixAffiche) / produit.prix) * 100)
    : 0;

  const handleAjouterAuPanier = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await ajouterAuPanier(produit._id);
  };

  return (
    <Link 
      to={`/produit/${produit.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-xl hover:shadow-gray-200/80 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        {photo ? (
          <img
            src={photo}
            alt={produit.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff size={40} className="text-gray-300" />
          </div>
        )}

        {/* Badge promo */}
        {aPromotion && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-lg">
            -{remise}%
          </div>
        )}

        {/* Bouton favori */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Ajouter aux favoris
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          title="Ajouter aux favoris"
          aria-label="Ajouter aux favoris"
        >
          <Heart size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-bold text-[#FC7701] uppercase tracking-wide mb-1">
          {produit.categorie?.nom}
        </span>

        <h3 className="font-semibold text-[#011023] text-sm leading-snug mb-3 line-clamp-2 flex-1">
          {produit.nom}
        </h3>

        {produit.vendeur && (
          <p className="text-xs text-gray-400 mb-3 truncate">
            par {produit.vendeur.nomEntreprise}
          </p>
        )}

        {/* Prix + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="font-black text-base text-[#011023]">{formatPrix(prixAffiche)}</span>
            {aPromotion && (
              <span className="block text-xs text-gray-400 line-through leading-none">
                {formatPrix(produit.prix)}
              </span>
            )}
          </div>
          <button
            onClick={handleAjouterAuPanier}
            disabled={produit.enStock === false}
            className="cursor-pointer w-9 h-9 bg-[#011023] group-hover:bg-[#FC7701] text-white rounded-xl flex items-center justify-center transition-all group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            title={produit.enStock === false ? 'Produit indisponible' : 'Ajouter au panier'}
            aria-label={produit.enStock === false ? 'Produit indisponible' : 'Ajouter au panier'}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
