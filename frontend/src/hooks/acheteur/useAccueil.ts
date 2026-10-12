import { useState, useEffect } from 'react';
import type { CategorieResumee, ProduitPromotion, ProduitResume, PublicitePublique } from '../../types/acheteur';
import { getAccueil } from '../../services/acheteur/acheteurAccueilService';

interface EtatAccueil {
  categories: CategorieResumee[];
  nouveautes: ProduitResume[];
  bestSellers: ProduitResume[];
  publicites: { haut: PublicitePublique[]; milieu: PublicitePublique[] };
  promotions: ProduitPromotion[];
  chargement: boolean;
  erreur: string | null;
}

/**
 * Charge les données de la page d'accueil :
 * catégories, nouveautés, best sellers, campagnes publicitaires et promotions.
 */
export function useAccueil(): EtatAccueil {
  const [categories, setCategories] = useState<CategorieResumee[]>([]);
  const [nouveautes, setNouveautes] = useState<ProduitResume[]>([]);
  const [bestSellers, setBestSellers] = useState<ProduitResume[]>([]);
  const [publicites, setPublicites] = useState<EtatAccueil['publicites']>({ haut: [], milieu: [] });
  const [promotions, setPromotions] = useState<ProduitPromotion[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const rep = await getAccueil();
        if (annule) return;
        setCategories(rep.data.categories);
        setNouveautes(rep.data.nouveautes);
        setBestSellers(rep.data.bestSellers);
        setPublicites(rep.data.publicites ?? { haut: [], milieu: [] });
        setPromotions(rep.data.promotions ?? []);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, []);

  return { categories, nouveautes, bestSellers, publicites, promotions, chargement, erreur };
}
