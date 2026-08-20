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
  /** En mode inline, pas de section wrapper avec padding/max-width */
  mode?: 'section' | 'inline';
}

export default function SectionProduitsMis({
  titre,
  sousTitre,
  produits,
  chargement,
  lienVoirPlus = '/catalogue',
  mode = 'section',
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
    const squelettesGrille = (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
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
    );
    if (mode === 'inline') {
      return <div>{squelettesGrille}</div>;
    }
    return (
      <section className="py-12 sm:py-16 bg-[#F8F9FF]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg mb-8" />
          {squelettesGrille}
        </div>
      </section>
    );
  }

  if (!produits.length) return null;

  const contenu = (
    <>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <p className="text-[#FC7701] text-xs font-bold uppercase tracking-widest mb-2">
            {sousTitre ?? 'Sélection du moment'}
          </p>
          <h2 className={`font-black text-[#011023] leading-tight ${mode === 'inline' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>{titre}</h2>
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

          {/* Flèches — masquées sur mobile */}
          <div className="hidden sm:flex gap-1.5">
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

      {/* Grille : 2 colonnes sur mobile, 3 sur sm, 5 sur lg */}
      <div ref={refDefilement} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {produits.slice(0, 100).map((produit) => (
          <CarteProduit key={produit._id} produit={produit} />
        ))}
      </div>

      {/* Voir tout */}
      <div className="text-center mt-8 sm:mt-10">
        <Link
          to={lienVoirPlus}
          className="inline-flex items-center gap-2 border-2 border-[#011023] text-[#011023] font-semibold px-8 py-3 rounded-xl hover:bg-[#011023] hover:text-white transition-all text-sm"
        >
          Voir tous les produits
          <ArrowRight size={16} />
        </Link>
      </div>
    </>
  );

  if (mode === 'inline') {
    return <div>{contenu}</div>;
  }

  return (
    <section className="py-12 sm:py-16 bg-[#F8F9FF]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        {contenu}
      </div>
    </section>
  );
}
