import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavoris } from '../../../context/FavorisContext';

interface Props {
  produitId: string;
  /** 'carte' : pastille ronde sur une image ; 'fiche' : grand bouton carré */
  variante?: 'carte' | 'fiche';
  className?: string;
}

/** Cœur « ajouter / retirer des favoris » — état partagé via FavorisContext. */
export default function BoutonFavori({ produitId, variante = 'carte', className = '' }: Props) {
  const { estFavori, basculer } = useFavoris();
  const [anime, setAnime] = useState(false);
  const actif = estFavori(produitId);

  const surClic = async (e: React.MouseEvent) => {
    e.preventDefault();   // la carte produit est un lien
    e.stopPropagation();
    if (!actif) setAnime(true);
    await basculer(produitId);
  };

  const libelle = actif ? 'Retirer des favoris' : 'Ajouter aux favoris';
  const base = variante === 'carte'
    ? 'w-8 h-8 bg-white rounded-full shadow-md'
    : 'w-14 h-14 rounded-xl border-2 ' + (actif ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-red-300');

  return (
    <button
      type="button"
      onClick={surClic}
      aria-pressed={actif}
      aria-label={libelle}
      title={libelle}
      className={`cursor-pointer flex items-center justify-center transition-all hover:scale-110 ${base} ${className}`}
    >
      <Heart
        size={variante === 'carte' ? 16 : 20}
        onAnimationEnd={() => setAnime(false)}
        className={`transition-colors ${actif ? 'fill-red-500 text-red-500' : 'text-gray-400'} ${anime ? 'animate-[ping_0.4s_ease-out_1]' : ''}`}
      />
    </button>
  );
}
