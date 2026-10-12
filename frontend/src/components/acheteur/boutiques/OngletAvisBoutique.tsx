import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquareText, Package } from 'lucide-react';
import type { AvisBoutiquePublic, BoutiqueDetail } from '../../../types/acheteur';
import { getAvisBoutique } from '../../../services/acheteur/acheteurBoutiqueService';
import CarteAvis from '../avis/CarteAvis';

/** Derniers avis publiés sur les produits de la boutique, avec le produit concerné. */
export default function OngletAvisBoutique({ boutique }: { boutique: BoutiqueDetail }) {
  const [avis, setAvis]             = useState<AvisBoutiquePublic[]>([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      try {
        const { data } = await getAvisBoutique(boutique.slug, page);
        if (annule) return;
        setAvis((prec) => (page === 1 ? data.avis : [...prec, ...data.avis]));
        setTotalPages(data.pagination.totalPages);
      } catch {
        /* non bloquant */
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [boutique.slug, page]);

  if (!chargement && avis.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-14 bg-white rounded-2xl border border-gray-100">
        <MessageSquareText size={28} className="text-gray-300 mb-3" />
        <p className="text-sm font-semibold text-[#011023]">Pas encore d'avis</p>
        <p className="text-sm text-gray-500 mt-1">Les clients notent les produits après réception de leur commande.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 sm:px-8">
      <div className="divide-y divide-gray-100">
        {avis.map((a) => (
          <div key={a._id}>
            {a.produit && (
              <Link to={`/produit/${a.produit.slug}`} className="flex items-center gap-2.5 pt-5 -mb-2 text-xs text-gray-500 hover:text-[#FC7701]">
                <span className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                  {a.produit.photoCouverture ? <img src={a.produit.photoCouverture} alt="" className="w-full h-full object-cover" /> : <Package size={14} className="text-gray-300" />}
                </span>
                <span className="truncate">{a.produit.nom}</span>
              </Link>
            )}
            <CarteAvis avis={a} nomBoutique={boutique.nomEntreprise} />
          </div>
        ))}
      </div>

      {(page < totalPages || chargement) && (
        <div className="py-5 border-t border-gray-100">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={chargement}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center gap-2"
          >
            {chargement && <Loader2 size={14} className="animate-spin" />} Voir plus d'avis
          </button>
        </div>
      )}
    </div>
  );
}
