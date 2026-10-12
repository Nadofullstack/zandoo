import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ChevronRight, RefreshCw, Search, Store, X } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import CarteBoutique from '../../components/acheteur/boutiques/CarteBoutique';
import PaginationCatalogue from '../../components/acheteur/catalogue/PaginationCatalogue';
import { cascade, fondu } from '../../components/acheteur/accueil/animations';
import { getBoutiques } from '../../services/acheteur/acheteurBoutiqueService';
import type { BoutiqueResume, Pagination, TriBoutiques } from '../../types/acheteur';

const TRIS: { valeur: TriBoutiques; libelle: string }[] = [
  { valeur: 'populaires', libelle: 'Plus de produits' },
  { valeur: 'note',       libelle: 'Mieux notées' },
  { valeur: 'recentes',   libelle: 'Nouvelles boutiques' },
  { valeur: 'nom',        libelle: 'Nom (A → Z)' },
];

const PAR_PAGE = 12;
const DELAI_RECHERCHE_MS = 350;
const SELECT = 'text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#FC7701]';

/** Annuaire des boutiques : recherche, filtres par secteur et ville, tri. Filtres synchronisés avec l'URL. */
export default function BoutiquesPage() {
  const [params, setParams] = useSearchParams();
  const recherche = params.get('q') ?? '';
  const secteur   = params.get('secteur') ?? '';
  const ville     = params.get('ville') ?? '';
  const triParam  = params.get('tri') as TriBoutiques | null;
  const tri: TriBoutiques = TRIS.some((t) => t.valeur === triParam) ? triParam! : 'populaires';
  const page      = Math.max(1, Number(params.get('page')) || 1);

  const [saisie, setSaisie]         = useState(recherche);
  const [boutiques, setBoutiques]   = useState<BoutiqueResume[]>([]);
  const [filtres, setFiltres]       = useState<{ secteurs: string[]; villes: string[] }>({ secteurs: [], villes: [] });
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [version, setVersion]       = useState(0);

  const majParams = (maj: Record<string, string | undefined>) => {
    setParams((prec) => {
      const suivant = new URLSearchParams(prec);
      Object.entries(maj).forEach(([cle, valeur]) => (valeur ? suivant.set(cle, valeur) : suivant.delete(cle)));
      if (!('page' in maj)) suivant.delete('page');
      return suivant;
    }, { replace: true });
  };

  /* Recherche différée : l'URL n'est mise à jour qu'après une courte pause de frappe */
  useEffect(() => {
    if (saisie.trim() === recherche) return;
    const minuteur = setTimeout(() => {
      setParams((prec) => {
        const suivant = new URLSearchParams(prec);
        if (saisie.trim()) suivant.set('q', saisie.trim()); else suivant.delete('q');
        suivant.delete('page');
        return suivant;
      }, { replace: true });
    }, DELAI_RECHERCHE_MS);
    return () => clearTimeout(minuteur);
  }, [saisie, recherche, setParams]);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const { data } = await getBoutiques({ recherche, secteur, ville, tri, page, limite: PAR_PAGE });
        if (annule) return;
        setBoutiques(data.boutiques);
        setFiltres(data.filtres);
        setPagination(data.pagination);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Impossible de charger les boutiques.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [recherche, secteur, ville, tri, page, version]);

  const filtreActif = !!(recherche || secteur || ville);

  return (
    <MotionConfig reducedMotion="user">
      <AcheteurLayout>
        {/* En-tête */}
        <section className="relative overflow-hidden bg-[#011023]">
          <div className="absolute -top-40 left-1/3 w-[520px] h-[520px] rounded-full bg-[#FC7701]/15 blur-[130px] pointer-events-none" aria-hidden="true" />
          <motion.div variants={cascade(0.1)} initial="cache" animate="visible" className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <motion.nav variants={fondu} aria-label="Fil d'Ariane" className="flex items-center gap-1 text-xs text-white/50 mb-5">
              <Link to="/" className="hover:text-white">Accueil</Link>
              <ChevronRight size={12} />
              <span className="text-white/80">Boutiques</span>
            </motion.nav>
            <motion.h1 variants={fondu} className="text-3xl sm:text-5xl font-black text-white tracking-tight">Nos boutiques</motion.h1>
            <motion.p variants={fondu} className="mt-3 text-white/60 max-w-xl">
              Découvrez les vendeurs de la marketplace : artisans, commerçants, grossistes et marques locales.
            </motion.p>

            {/* Recherche */}
            <motion.div variants={fondu} className="mt-7 max-w-xl relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={saisie}
                onChange={(e) => setSaisie(e.target.value)}
                placeholder="Nom de boutique, secteur d'activité…"
                aria-label="Rechercher une boutique"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-sm text-[#011023] shadow-xl shadow-black/20 focus:outline-none focus:ring-4 focus:ring-[#FC7701]/30"
              />
            </motion.div>
          </motion.div>
        </section>

        <div className="bg-[#F8F9FF] min-h-[50vh]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select value={secteur} onChange={(e) => majParams({ secteur: e.target.value || undefined })} aria-label="Secteur d'activité" className={SELECT}>
                <option value="">Tous les secteurs</option>
                {filtres.secteurs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={ville} onChange={(e) => majParams({ ville: e.target.value || undefined })} aria-label="Ville" className={SELECT}>
                <option value="">Toutes les villes</option>
                {filtres.villes.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              {filtreActif && (
                <button onClick={() => { setSaisie(''); setParams({}, { replace: true }); }} className="inline-flex items-center gap-1 text-sm font-semibold text-[#FC7701] hover:underline">
                  <X size={14} /> Réinitialiser
                </button>
              )}
              <div className="ml-auto flex items-center gap-3">
                {pagination && <span className="text-sm text-gray-500 hidden sm:inline">{pagination.total} boutique{pagination.total > 1 ? 's' : ''}</span>}
                <select value={tri} onChange={(e) => majParams({ tri: e.target.value === 'populaires' ? undefined : e.target.value })} aria-label="Trier les boutiques" className={SELECT}>
                  {TRIS.map((t) => <option key={t.valeur} value={t.valeur}>{t.libelle}</option>)}
                </select>
              </div>
            </div>

            {erreur ? (
              <div className="flex flex-col items-center text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-600">{erreur}</p>
                <button onClick={() => setVersion((v) => v + 1)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">
                  <RefreshCw size={14} /> Réessayer
                </button>
              </div>
            ) : chargement && boutiques.length === 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
              </div>
            ) : boutiques.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4"><Store size={22} className="text-[#FC7701]" /></div>
                <h2 className="text-base font-bold text-[#011023]">Aucune boutique trouvée</h2>
                <p className="text-sm text-gray-500 mt-1">{filtreActif ? 'Essayez avec d’autres critères.' : 'Les premières boutiques arrivent bientôt.'}</p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${recherche}|${secteur}|${ville}|${tri}|${page}`}
                    variants={cascade(0.05)}
                    initial="cache"
                    animate="visible"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    className={`grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity ${chargement ? 'opacity-60' : ''}`}
                  >
                    {boutiques.map((b) => <CarteBoutique key={b._id} boutique={b} />)}
                  </motion.div>
                </AnimatePresence>
                {pagination && <PaginationCatalogue pagination={pagination} onChangerPage={(p) => majParams({ page: p > 1 ? String(p) : undefined })} />}
              </>
            )}
          </div>
        </div>
      </AcheteurLayout>
    </MotionConfig>
  );
}
