import { useState, useEffect, useCallback } from 'react';
import type { ProduitResume, Pagination, FiltresCatalogue, TriCatalogue } from '../../types/acheteur';
import { getProduits, rechercherProduits } from '../../services/acheteur/acheteurCatalogueService';

interface EtatFiltre {
  categorie: string;
  recherche: string;
  tri: TriCatalogue;
  prixMin: string;
  prixMax: string;
  page: number;
}

const FILTRE_INITIAL: EtatFiltre = {
  categorie: '',
  recherche: '',
  tri: 'recent',
  prixMin: '',
  prixMax: '',
  page: 1,
};

interface EtatCatalogue {
  produits: ProduitResume[];
  pagination: Pagination | null;
  chargement: boolean;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  recharger: () => void;
}

/**
 * Gère la liste paginée et filtrée du catalogue produits.
 */
export function useCatalogue(): EtatCatalogue {
  const [produits, setProduits] = useState<ProduitResume[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltreState] = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteur, setCompteur] = useState(0);

  const setFiltre = useCallback((f: Partial<EtatFiltre>) => {
    setFiltreState((prev) => ({ ...prev, ...f, page: f.page ?? 1 }));
  }, []);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        let rep;

        /* Si une recherche est active, on utilise l'endpoint dédié */
        if (filtre.recherche.trim()) {
          rep = await rechercherProduits(filtre.recherche.trim(), filtre.page);
        } else {
          const params: FiltresCatalogue = {
            tri:       filtre.tri,
            page:      filtre.page,
            categorie: filtre.categorie || undefined,
            prixMin:   filtre.prixMin ? Number(filtre.prixMin) : undefined,
            prixMax:   filtre.prixMax ? Number(filtre.prixMax) : undefined,
          };
          rep = await getProduits(params);
        }

        if (annule) return;
        setProduits(rep.data.produits);
        setPagination(rep.data.pagination);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [
    filtre.categorie,
    filtre.recherche,
    filtre.tri,
    filtre.prixMin,
    filtre.prixMax,
    filtre.page,
    compteur,
  ]);

  return { produits, pagination, chargement, erreur, filtre, setFiltre, recharger };
}
