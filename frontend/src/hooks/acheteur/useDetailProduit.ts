import { useState, useEffect } from 'react';
import type { ProduitDetail, ProduitResume } from '../../types/acheteur';
import { getProduitParSlug } from '../../services/acheteur/acheteurCatalogueService';

interface EtatDetailProduit {
  produit: ProduitDetail | null;
  similaires: ProduitResume[];
  chargement: boolean;
  erreur: string | null;
}

/**
 * Charge le détail d'un produit et ses produits similaires à partir du slug.
 */
export function useDetailProduit(slug: string): EtatDetailProduit {
  const [produit, setProduit] = useState<ProduitDetail | null>(null);
  const [similaires, setSimilaires] = useState<ProduitResume[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const rep = await getProduitParSlug(slug);
        if (annule) return;
        setProduit(rep.data.produit);
        setSimilaires(rep.data.similaires);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Produit introuvable.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [slug]);

  return { produit, similaires, chargement, erreur };
}
