import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ChevronRight, Flame, RefreshCw, Tag } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import CarteProduit from '../../components/acheteur/accueil/CarteProduit';
import PaginationCatalogue from '../../components/acheteur/catalogue/PaginationCatalogue';
import { cascade, elementCascade, fondu } from '../../components/acheteur/accueil/animations';
import { getPromotions, type TriPromotions } from '../../services/acheteur/acheteurCatalogueService';
import type { Pagination, ProduitPromotion } from '../../types/acheteur';

const TRIS: { valeur: TriPromotions; libelle: string }[] = [
  { valeur: 'remise',    libelle: 'Plus grosses remises' },
  { valeur: 'prix_asc',  libelle: 'Prix croissant' },
  { valeur: 'prix_desc', libelle: 'Prix décroissant' },
  { valeur: 'recent',    libelle: 'Plus récentes' },
];

const PAR_PAGE = 24;

/** Page « Promotions » : tous les produits en promotion, triables et paginés. */
export default function PromotionsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const triParam = params.get('tri') as TriPromotions | null;
  const tri: TriPromotions = TRIS.some((t) => t.valeur === triParam) ? triParam! : 'remise';

  const [produits, setProduits]     = useState<ProduitPromotion[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [version, setVersion]       = useState(0);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await getPromotions({ page, tri, limite: PAR_PAGE });
        if (annule) return;
        setProduits(data.produits);
        setPagination(data.pagination);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger les promotions.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [page, tri, version]);

  const majParams = (maj: { page?: number; tri?: TriPromotions }) => {
    const suivant = new URLSearchParams(params);
    if (maj.tri !== undefined) {
      if (maj.tri === 'remise') suivant.delete('tri'); else suivant.set('tri', maj.tri);
      suivant.delete('page');
    }
    if (maj.page !== undefined) {
      if (maj.page > 1) suivant.set('page', String(maj.page)); else suivant.delete('page');
    }
    setParams(suivant);
  };

  const remiseMax = produits.length ? Math.max(...produits.map((p) => p.remise)) : 0;

  return (
    <MotionConfig reducedMotion="user">
      <AcheteurLayout>
        {/* En-tête */}
        <section className="relative overflow-hidden bg-[#011023]">
          <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-[#FC7701]/20 blur-[120px] pointer-events-none" aria-hidden="true" />
          <motion.div
            variants={cascade(0.1)}
            initial="cache"
            animate="visible"
            className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16"
          >
            <motion.nav variants={fondu} aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-white/50 mb-5">
              <Link to="/" className="hover:text-white">Accueil</Link>
              <ChevronRight size={12} />
              <span className="text-white/80">Promotions</span>
            </motion.nav>
            <motion.span variants={fondu} className="inline-flex items-center gap-2 rounded-full bg-[#FC7701]/15 border border-[#FC7701]/30 px-3.5 py-1.5 mb-4">
              <Flame size={14} className="text-[#FC7701]" />
              <span className="text-[#FC7701] text-xs font-bold uppercase tracking-[0.18em]">Bonnes affaires</span>
            </motion.span>
            <motion.h1 variants={fondu} className="text-3xl sm:text-5xl font-black text-white tracking-tight">Promotions</motion.h1>
            <motion.p variants={fondu} className="mt-3 text-white/60 max-w-xl">
              {pagination?.total
                ? <>{pagination.total} produit{pagination.total > 1 ? 's' : ''} à prix réduit{remiseMax > 0 && <>, jusqu'à <span className="text-[#FC7701] font-bold">-{remiseMax} %</span></>}.</>
                : 'Les meilleures réductions des boutiques ZANDOO.'}
            </motion.p>
          </motion.div>
        </section>

        <div className="bg-[#F8F9FF] min-h-[50vh]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
            {/* Barre de tri */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <p className="text-sm text-gray-500">{pagination ? `Page ${pagination.page} sur ${Math.max(1, pagination.totalPages)}` : ' '}</p>
              <select
                value={tri}
                onChange={(e) => majParams({ tri: e.target.value as TriPromotions })}
                aria-label="Trier les promotions"
                className="text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#FC7701]"
              >
                {TRIS.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
              </select>
            </div>

            {erreur ? (
              <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-600">{erreur}</p>
                <button onClick={() => setVersion((v) => v + 1)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">
                  <RefreshCw size={14} /> Réessayer
                </button>
              </div>
            ) : chargement && produits.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
              </div>
            ) : produits.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4"><Tag size={22} className="text-[#FC7701]" /></div>
                <h2 className="text-base font-bold text-[#011023]">Aucune promotion en cours</h2>
                <p className="text-sm text-gray-500 mt-1">Revenez bientôt : les boutiques publient régulièrement de nouvelles offres.</p>
                <Link to="/catalogue" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900]">
                  Voir le catalogue
                </Link>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${tri}-${page}`}
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
                {pagination && <PaginationCatalogue pagination={pagination} onChangerPage={(p) => majParams({ page: p })} />}
              </>
            )}
          </div>
        </div>
      </AcheteurLayout>
    </MotionConfig>
  );
}
