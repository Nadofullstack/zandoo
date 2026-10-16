import { Link } from 'react-router-dom';
import { Package, X } from 'lucide-react';
import type { ProduitMessage } from '../../types/messagerie';
import { formatPrixMessage } from './messagerieUtils';

interface Props {
  produit: ProduitMessage;
  /** Variante « pièce jointe » dans la zone de saisie, avec bouton de retrait */
  onRetirer?: () => void;
  /** Bulle de l'utilisateur (couleurs inversées) */
  surFondSombre?: boolean;
}

/** Carte produit partagée dans une conversation (lien vers la fiche). */
export default function CarteProduitMessage({ produit: p, onRetirer, surFondSombre }: Props) {
  const prix = p.prixPromotionnel ?? p.prix;
  const contenu = (
    <>
      <span className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
        {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-gray-300" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-semibold truncate ${surFondSombre ? 'text-white' : 'text-[#011023]'}`}>{p.nom}</span>
        <span className={`block text-sm font-bold ${surFondSombre ? 'text-[#FC7701]' : 'text-[#FC7701]'}`}>
          {formatPrixMessage(prix)}
          {p.prixPromotionnel && p.prixPromotionnel < p.prix && (
            <span className={`ml-1.5 text-xs font-normal line-through ${surFondSombre ? 'text-white/50' : 'text-gray-400'}`}>{formatPrixMessage(p.prix)}</span>
          )}
        </span>
      </span>
    </>
  );

  if (onRetirer) {
    return (
      <div className="flex items-center gap-3 p-2 pr-3 rounded-xl bg-white border border-gray-200">
        {contenu}
        <button type="button" onClick={onRetirer} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" aria-label="Retirer le produit">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <Link
      to={`/produit/${p.slug}`}
      className={`flex items-center gap-3 p-2 pr-3 rounded-xl min-w-[220px] max-w-xs transition-colors ${
        surFondSombre ? 'bg-white/10 hover:bg-white/15' : 'bg-white border border-gray-200 hover:border-gray-300'
      }`}
    >
      {contenu}
    </Link>
  );
}
