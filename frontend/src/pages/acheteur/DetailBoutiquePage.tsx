import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ChevronRight, Store } from 'lucide-react';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import EnTeteBoutique from '../../components/acheteur/boutiques/EnTeteBoutique';
import OngletProduitsBoutique from '../../components/acheteur/boutiques/OngletProduitsBoutique';
import OngletAvisBoutique from '../../components/acheteur/boutiques/OngletAvisBoutique';
import OngletAProposBoutique from '../../components/acheteur/boutiques/OngletAProposBoutique';
import { EASE_SORTIE } from '../../components/acheteur/accueil/animations';
import { getBoutique } from '../../services/acheteur/acheteurBoutiqueService';
import type { BoutiqueDetail } from '../../types/acheteur';

type Onglet = 'produits' | 'avis' | 'a-propos';

/** Vitrine publique d'une boutique : produits, avis clients, présentation et livraison. */
export default function DetailBoutiquePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const ongletParam = params.get('onglet') as Onglet | null;
  const onglet: Onglet = ongletParam === 'avis' || ongletParam === 'a-propos' ? ongletParam : 'produits';

  const [boutique, setBoutique]     = useState<BoutiqueDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setIntrouvable(false);
      try {
        const { data } = await getBoutique(slug);
        if (!annule) setBoutique(data.boutique);
      } catch {
        if (!annule) setIntrouvable(true);
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [slug]);

  /* Titre de l'onglet du navigateur (partage, historique) */
  useEffect(() => {
    if (!boutique) return;
    const precedent = document.title;
    document.title = `${boutique.nomEntreprise} — ZANDOO`;
    return () => { document.title = precedent; };
  }, [boutique]);

  const ONGLETS: { id: Onglet; libelle: string; compteur?: number }[] = boutique ? [
    { id: 'produits', libelle: 'Produits', compteur: boutique.nombreProduits },
    { id: 'avis',     libelle: 'Avis',     compteur: boutique.nombreAvis },
    { id: 'a-propos', libelle: 'À propos & livraison' },
  ] : [];

  const changerOnglet = (id: Onglet) => setParams(id === 'produits' ? {} : { onglet: id }, { replace: true });

  return (
    <MotionConfig reducedMotion="user">
      <AcheteurLayout>
        {chargement && !boutique ? (
          <div className="animate-pulse">
            <div className="h-44 sm:h-60 lg:h-72 bg-[#011023]" />
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 -mt-14">
              <div className="w-28 h-28 rounded-3xl bg-gray-200 ring-4 ring-white" />
              <div className="h-8 w-72 max-w-full bg-gray-200 rounded-lg mt-4" />
              <div className="h-20 bg-gray-100 rounded-2xl mt-6" />
            </div>
          </div>
        ) : introuvable || !boutique ? (
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-4"><Store size={26} className="text-[#FC7701]" /></div>
            <h1 className="text-xl font-black text-[#011023]">Boutique introuvable</h1>
            <p className="text-sm text-gray-500 mt-2">Cette boutique n'existe pas ou n'est plus disponible.</p>
            <Link to="/boutiques" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FC7701] hover:bg-[#e06900]">
              Voir toutes les boutiques
            </Link>
          </div>
        ) : (
          <>
            <nav aria-label="Fil d'Ariane" className="bg-white border-b border-gray-100">
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex items-center gap-1 text-xs text-gray-500">
                <Link to="/" className="hover:text-[#FC7701]">Accueil</Link>
                <ChevronRight size={12} />
                <Link to="/boutiques" className="hover:text-[#FC7701]">Boutiques</Link>
                <ChevronRight size={12} />
                <span className="text-gray-700 font-medium truncate">{boutique.nomEntreprise}</span>
              </div>
            </nav>

            <EnTeteBoutique boutique={boutique} />

            {/* Onglets (collants sous la barre de navigation) */}
            <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur border-b border-gray-100">
              <div role="tablist" aria-label="Sections de la boutique" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 flex gap-1 overflow-x-auto [scrollbar-width:none]">
                {ONGLETS.map((o) => {
                  const actif = onglet === o.id;
                  return (
                    <button
                      key={o.id}
                      role="tab"
                      aria-selected={actif}
                      onClick={() => changerOnglet(o.id)}
                      className={`relative shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors ${actif ? 'text-[#011023]' : 'text-gray-500 hover:text-[#011023]'}`}
                    >
                      {o.libelle}
                      {o.compteur !== undefined && <span className="ml-1.5 text-xs text-gray-400 tabular-nums">{o.compteur}</span>}
                      {actif && <motion.span layoutId="onglet-boutique" className="absolute left-2 right-2 bottom-0 h-[3px] rounded-t-full bg-[#FC7701]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#F8F9FF] min-h-[50vh]">
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={onglet}
                    role="tabpanel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_SORTIE } }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                  >
                    {onglet === 'produits' && <OngletProduitsBoutique boutique={boutique} />}
                    {onglet === 'avis' && <OngletAvisBoutique boutique={boutique} />}
                    {onglet === 'a-propos' && <OngletAProposBoutique boutique={boutique} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </AcheteurLayout>
    </MotionConfig>
  );
}
