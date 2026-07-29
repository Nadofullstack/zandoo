import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { ProduitResume } from '../../../types/acheteur';
import CarteProduit from './CarteProduit';

interface Props {
  titre: string;
  sousTitre?: string;
  produits: ProduitResume[];
  chargement: boolean;
  lienVoirPlus?: string;
}

export default function SectionProduitsMis({
  titre,
  sousTitre,
  produits,
  chargement,
  lienVoirPlus = '/catalogue',
}: Props) {
  const refDefilement = useRef<HTMLDivElement>(null);
  const [ongletActif, setOngletActif] = useState<'nouveautes' | 'populaires'>('nouveautes');

  const defiler = (dir: 'gauche' | 'droite') => {
    refDefilement.current?.scrollBy({
      left: dir === 'droite' ? 320 : -320,
      behavior: 'smooth',
    });
  };

  /* ── Squelettes ───────────────────────────────── */
  if (chargement) {
    return (
      <section className="py-16 bg-[#F8F9FF]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!produits.length) return null;

  return (
    <section className="py-16 bg-[#F8F9FF]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">
              {sousTitre ?? 'Sélection du moment'}
            </p>
            <h2 className="text-3xl font-black text-[#011023] leading-tight">{titre}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Onglets */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setOngletActif('nouveautes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ongletActif === 'nouveautes'
                    ? 'bg-[#011023] text-white'
                    : 'text-gray-500 hover:text-[#011023]'
                }`}
              >
                Nouveautés
              </button>
              <button
                onClick={() => setOngletActif('populaires')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  ongletActif === 'populaires'
                    ? 'bg-[#011023] text-white'
                    : 'text-gray-500 hover:text-[#011023]'
                }`}
              >
                Populaires
              </button>
            </div>

            {/* Flèches */}
            <div className="flex gap-1.5">
              <button
                onClick={() => defiler('gauche')}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
                aria-label="Précédent"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => defiler('droite')}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:border-[#FC7701] hover:text-[#FC7701] transition-all"
                aria-label="Suivant"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Grille */}
        <div ref={refDefilement} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {produits.slice(0, 8).map((produit) => (
            <CarteProduit key={produit._id} produit={produit} />
          ))}
        </div>

        {/* Voir tout */}
        <div className="text-center mt-10">
          <Link
            to={lienVoirPlus}
            className="inline-flex items-center gap-2 border-2 border-[#011023] text-[#011023] font-semibold px-8 py-3 rounded-xl hover:bg-[#011023] hover:text-white transition-all text-sm"
          >
            Voir tous les produits
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
