import AcheteurLayout from '../../components/acheteur/layout/AcheteurLayout';
import SectionHero from '../../components/acheteur/accueil/SectionHero';
import SectionCategories from '../../components/acheteur/accueil/SectionCategories';
import SectionProduitsMis from '../../components/acheteur/accueil/SectionProduitsMis';
import SectionBanniereVendeur from '../../components/acheteur/accueil/SectionBanniereVendeur';
import SectionValeursMarque from '../../components/acheteur/accueil/SectionValeursMarque';
import { useAccueil } from '../../hooks/acheteur/useAccueil';

export default function AccueilPage() {
  const { categories, nouveautes, bestSellers, chargement } = useAccueil();

  return (
    <AcheteurLayout>
      {/* 1 — Héro */}
      <SectionHero />

      {/* 2 — Disposition : catégories sidebar gauche + produits */}
      <div className="bg-[#F8F9FF]">
        <div className=" mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex gap-8 items-start py-10 sm:py-14">

            {/* Sidebar catégories — masquée sur mobile */}
            <div className="hidden lg:block w-64 shrink-0">
              <SectionCategories categories={categories} chargement={chargement} />
            </div>

            {/* Produits */}
            <div className="flex-1 min-w-0">
              <SectionProduitsMis
                titre="Nouveautés"
                sousTitre="Arrivages récents"
                produits={nouveautes}
                chargement={chargement}
                lienVoirPlus="/catalogue?tri=recent"
                mode="inline"
              />
            </div>
          </div>

          {/* Catégories visible sur mobile — en dessous des produits */}
          <div className="lg:hidden pb-8">
            <SectionCategories categories={categories} chargement={chargement} />
          </div>
        </div>
      </div>

      {/* 3 — Bannière vendeur */}
      <SectionBanniereVendeur />

      {/* 4 — Valeurs */}
      <SectionValeursMarque />
    </AcheteurLayout>
  );
}
