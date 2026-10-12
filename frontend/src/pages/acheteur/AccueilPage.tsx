import { MotionConfig } from 'framer-motion';
import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import SectionHero from '../../components/acheteur/accueil/SectionHero';
import CarrouselPublicitaire from '../../components/acheteur/accueil/CarrouselPublicitaire';
import SectionPromotions from '../../components/acheteur/accueil/SectionPromotions';
import BannieresPublicitaires from '../../components/acheteur/accueil/BannieresPublicitaires';
import SectionCategories from '../../components/acheteur/accueil/SectionCategories';
import SectionProduitsMis from '../../components/acheteur/accueil/SectionProduitsMis';
import SectionBanniereVendeur from '../../components/acheteur/accueil/SectionBanniereVendeur';
import SectionValeursMarque from '../../components/acheteur/accueil/SectionValeursMarque';
import Apparition from '../../components/acheteur/accueil/Apparition';
import { useAccueil } from '../../hooks/acheteur/useAccueil';
import { useSuiviPublicites } from '../../hooks/acheteur/useSuiviPublicites';

/**
 * Page d'accueil acheteur.
 *
 *  1. Campagnes à la une (carrousel) — ou le héro de marque s'il n'y en a aucune
 *  2. Promotions du moment
 *  3. Catégories + nouveautés
 *  4. Bannières partenaires
 *  5. Devenir vendeur · Valeurs de la marque
 *
 * <MotionConfig reducedMotion="user"> : les animations de mouvement sont
 * neutralisées si l'utilisateur a activé « réduire les animations ».
 */
export default function AccueilPage() {
  const { categories, nouveautes, publicites, promotions, chargement } = useAccueil();
  const { marquerVue, marquerClic } = useSuiviPublicites();

  return (
    <MotionConfig reducedMotion="user">
      <AcheteurLayout>
        {/* 1 — À la une */}
        {chargement ? (
          <div className="h-[340px] sm:h-[440px] lg:h-[540px] bg-[#011023] relative overflow-hidden" aria-busy="true" aria-label="Chargement des offres">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-pulse" />
          </div>
        ) : publicites.haut.length > 0 ? (
          <CarrouselPublicitaire publicites={publicites.haut} onVue={marquerVue} onClic={marquerClic} />
        ) : (
          <SectionHero />
        )}

        {/* 2 — Promotions */}
        {promotions.length > 0 && <SectionPromotions promotions={promotions} />}

        {/* 3 — Catégories (barre latérale) + nouveautés */}
        <div className="bg-[#F8F9FF]">
          <div className="mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex gap-8 items-start py-10 sm:py-14">
              <Apparition className="hidden lg:block w-64 shrink-0">
                <SectionCategories categories={categories} chargement={chargement} />
              </Apparition>

              <Apparition className="flex-1 min-w-0" delai={0.1}>
                <SectionProduitsMis
                  titre="Nouveautés"
                  sousTitre="Arrivages récents"
                  produits={nouveautes}
                  chargement={chargement}
                  lienVoirPlus="/catalogue?tri=recent"
                  mode="inline"
                />
              </Apparition>
            </div>

            {/* Catégories sur mobile, sous les produits */}
            <div className="lg:hidden pb-8">
              <SectionCategories categories={categories} chargement={chargement} />
            </div>
          </div>
        </div>

        {/* 4 — Bannières partenaires */}
        {publicites.milieu.length > 0 && (
          <BannieresPublicitaires publicites={publicites.milieu} onVue={marquerVue} onClic={marquerClic} />
        )}

        {/* 5 — Devenir vendeur · Valeurs */}
        <Apparition><SectionBanniereVendeur /></Apparition>
        <Apparition><SectionValeursMarque /></Apparition>
      </AcheteurLayout>
    </MotionConfig>
  );
}
