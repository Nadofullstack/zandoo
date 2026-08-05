import { useState, useEffect, useCallback } from 'react';
import type { Categorie } from '../../types/admin';
import { getCategories } from '../../services/admin/adminCategorieService';

interface EtatHook {
  categories: Categorie[];
  chargement: boolean;
  erreur: string | null;
  recharger: () => void;
}

export function useGestionCategories(): EtatHook {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [compteur, setCompteur] = useState(0);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const rep = await getCategories();
        if (!annule) setCategories(rep.data.categories);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [compteur]);

  return { categories, chargement, erreur, recharger };
}
