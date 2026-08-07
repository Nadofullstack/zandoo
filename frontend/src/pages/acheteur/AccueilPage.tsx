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

      {/* 2 — Catégories */}
      <SectionCategories categories={categories} chargement={chargement} />

      {/* 3 — Nouveautés */}
      <SectionProduitsMis
        titre="Nouveautés"
        sousTitre="Arrivages récents"
        produits={nouveautes}
        chargement={chargement}
        lienVoirPlus="/catalogue?tri=recent"
      />

      {/* 4 — Bannière vendeur */}
      <SectionBanniereVendeur />
      
      {/* 6 — Valeurs */}
      <SectionValeursMarque />
    </AcheteurLayout>
  );
}
