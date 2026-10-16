import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageCircle } from 'lucide-react';
import { demarrerConversation } from '../../services/messagerieService';
import { lireSession } from '../../services/auth/authService';

interface Props {
  /** Produit concerné : il sera joint au premier message */
  produitId?: string;
  /** À défaut de produit, contacter directement une boutique */
  vendeurId?: string;
  variante?: 'carte' | 'fiche' | 'boutique';
  className?: string;
}

/**
 * « Discuter » : ouvre (ou retrouve) la conversation avec la boutique et
 * emmène l'acheteur dans le fil, produit déjà joint.
 */
export default function BoutonDiscuter({ produitId, vendeurId, variante = 'carte', className = '' }: Props) {
  const navigate = useNavigate();
  const [ouverture, setOuverture] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const surClic = async (e: React.MouseEvent) => {
    e.preventDefault();   // la carte produit est elle-même un lien
    e.stopPropagation();
    if (ouverture) return;

    if (!lireSession()) {
      navigate('/connexion', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    setOuverture(true);
    setErreur(null);
    try {
      const { conversation, produitContexte } = await demarrerConversation({ produitId, vendeurId });
      navigate(`/messages/${conversation._id}${produitContexte ? `?produit=${produitContexte}` : ''}`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Impossible de contacter la boutique.');
      setOuverture(false);
    }
  };

  const icone = ouverture ? <Loader2 size={variante === 'carte' ? 14 : 18} className="animate-spin" /> : <MessageCircle size={variante === 'carte' ? 14 : 18} />;

  const styles = {
    carte:    'h-9 px-3 rounded-xl text-xs font-semibold border border-gray-200 text-[#011023] hover:border-[#FC7701] hover:text-[#FC7701] hover:bg-orange-50',
    fiche:    'h-14 px-5 rounded-xl text-sm font-bold border-2 border-[#011023] text-[#011023] hover:bg-[#011023] hover:text-white',
    boutique: 'px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FC7701] text-white hover:bg-[#e06900] shadow-lg shadow-[#FC7701]/25',
  }[variante];

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={surClic}
        disabled={ouverture}
        className={`cursor-pointer w-full inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70 ${styles}`}
        aria-label={variante === 'boutique' ? 'Contacter la boutique' : 'Discuter avec le vendeur à propos de ce produit'}
      >
        {icone}
        {variante === 'boutique' ? 'Contacter la boutique' : variante === 'fiche' ? 'Discuter avec le vendeur' : 'Discuter'}
      </button>
      {erreur && (
        <span role="alert" className="absolute left-0 right-0 top-full mt-1 z-20 text-[11px] leading-tight text-red-600 bg-white border border-red-100 rounded-lg px-2 py-1 shadow-sm">
          {erreur}
        </span>
      )}
    </span>
  );
}
