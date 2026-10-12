import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Search, Tag } from 'lucide-react';
import type { BoutiqueDetail, Pagination, ProduitResume, TriProduitsBoutique } from '../../../types/acheteur';
import { getProduitsBoutique } from '../../../services/acheteur/acheteurBoutiqueService';
import CarteProduit from '../accueil/CarteProduit';
import PaginationCatalogue from '../catalogue/PaginationCatalogue';
import { cascade, elementCascade } from '../accueil/animations';

const TRIS: { valeur: TriProduitsBoutique; libelle: string }[] = [
  { valeur: 'recent',    libelle: 'Plus récents' },
  { valeur: 'prix_asc',  libelle: 'Prix croissant' },
  { valeur: 'prix_desc', libelle: 'Prix décroissant' },
  { valeur: 'note',      libelle: 'Mieux notés' },
];

const PAR_PAGE = 20;

/** Catalogue d'une boutique : filtres par catégorie (puces), promotions, recherche et tri. */
export default function OngletProduitsBoutique({ boutique }: { boutique: BoutiqueDetail }) {
  const [categorie, setCategorie] = useState<string | undefined>();
  const [promo, setPromo]         = useState(false);
  const [saisie, setSaisie]       = useState('');
  const [recherche, setRecherche] = useState('');
  const [tri, setTri]             = useState<TriProduitsBoutique>('recent');
  const [page, setPage]           = useState(1);

  const [produits, setProduits]     = useState<ProduitResume[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);

  /* Recherche différée */
  useEffect(() => {
    if (saisie.trim() === recherche) return;
    const minuteur = setTimeout(() => { setRecherche(saisie.trim()); setPage(1); }, 350);
    return () => clearTimeout(minuteur);
  }, [saisie, recherche]);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      try {
        const { data } = await getProduitsBoutique(boutique.slug, { categorie, promo, recherche, tri, page, limite: PAR_PAGE });
        if (annule) return;
        setProduits(data.produits);
        setPagination(data.pagination);
      } catch {
        if (!annule) setProduits([]);
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [boutique.slug, categorie, promo, recherche, tri, page]);

  const choisirCategorie = (id?: string) => { setCategorie(id); setPage(1); };

  return (
    <div>
      {/* Puces de catégories */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Puce actif={!categorie && !promo} onClick={() => { choisirCategorie(undefined); setPromo(false); }}>
          Tout <span className="opacity-60">{boutique.nombreProduits}</span>
        </Puce>
        {boutique.enPromotion > 0 && (
          <Puce actif={promo} onClick={() => { setPromo((p) => !p); setPage(1); }}>
            <Tag size={13} /> Promotions <span className="opacity-60">{boutique.enPromotion}</span>
          </Puce>
        )}
        {boutique.categories.map((c) => (
          <Puce key={c._id} actif={categorie === c._id} onClick={() => choisirCategorie(categorie === c._id ? undefined : c._id)}>
            {c.nom} <span className="opacity-60">{c.nombre}</span>
          </Puce>
        ))}
      </div>

      {/* Recherche + tri */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder={`Rechercher chez ${boutique.nomEntreprise}`}
            aria-label="Rechercher dans la boutique"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FC7701] focus:ring-2 focus:ring-[#FC7701]/20"
          />
        </div>
        <select
          value={tri}
          onChange={(e) => { setTri(e.target.value as TriProduitsBoutique); setPage(1); }}
          aria-label="Trier les produits"
          className="sm:ml-auto text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#FC7701]"
        >
          {TRIS.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
        </select>
      </div>

      {chargement && produits.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
        </div>
      ) : produits.length === 0 ? (
        <div className="flex flex-col items-center text-center py-14 bg-white rounded-2xl border border-gray-100">
          <Package size={28} className="text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-[#011023]">Aucun produit ne correspond</p>
          <p className="text-sm text-gray-500 mt-1">Modifiez la recherche ou la catégorie.</p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${categorie}|${promo}|${recherche}|${tri}|${page}`}
              variants={cascade(0.04)}
              initial="cache"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 transition-opacity ${chargement ? 'opacity-60' : ''}`}
            >
              {produits.map((p) => (
                <motion.div key={p._id} variants={elementCascade}>
                  <CarteProduit produit={p} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          {pagination && <PaginationCatalogue pagination={pagination} onChangerPage={setPage} />}
        </>
      )}
    </div>
  );
}

function Puce({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      whileTap={{ scale: 0.95 }}
      className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
        actif ? 'bg-[#011023] border-[#011023] text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-[#011023]'
      }`}
    >
      {children}
    </motion.button>
  );
}
