import { useState, useEffect, useCallback } from 'react';
import type { Produit, StatutProduit, StatistiquesProduits, Pagination } from '../../types/admin';
import {
  getProduits,
  getStatistiquesProduits,
  modifierStatutProduit,
  supprimerProduit,
} from '../../services/admin/adminProduitService';

interface EtatFiltre {
  statut: StatutProduit | '';
  categorie: string;
  vendeur: string;
  recherche: string;
  page: number;
}

const FILTRE_INITIAL: EtatFiltre = {
  statut: '', categorie: '', vendeur: '', recherche: '', page: 1,
};

interface EtatHook {
  produits: Produit[];
  pagination: Pagination | null;
  statistiques: StatistiquesProduits | null;
  chargement: boolean;
  chargementAction: string | null;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  approuverProduit: (id: string) => Promise<void>;
  rejeterProduit: (id: string, raison: string) => Promise<void>;
  supprimerProduit: (id: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionProduits(): EtatHook {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statistiques, setStatistiques] = useState<StatistiquesProduits | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
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
        const [repProduits, repStats] = await Promise.all([
          getProduits({
            statut:    filtre.statut    || undefined,
            categorie: filtre.categorie || undefined,
            vendeur:   filtre.vendeur   || undefined,
            recherche: filtre.recherche || undefined,
            page:      filtre.page,
          }),
          getStatistiquesProduits(),
        ]);
        if (annule) return;
        setProduits(repProduits.data.produits);
        setPagination(repProduits.data.pagination);
        setStatistiques(repStats.data.statistiques);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [filtre.statut, filtre.categorie, filtre.vendeur, filtre.recherche, filtre.page, compteur]);

  const approuverProduit = useCallback(async (id: string) => {
    setChargementAction(id);
    try {
      const rep = await modifierStatutProduit(id, 'approuve');
      setProduits((prev) => prev.map((p) => (p._id === id ? rep.data.produit : p)));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(null); }
  }, [recharger]);

  const rejeterProduit = useCallback(async (id: string, raison: string) => {
    setChargementAction(id);
    try {
      const rep = await modifierStatutProduit(id, 'rejete', raison);
      setProduits((prev) => prev.map((p) => (p._id === id ? rep.data.produit : p)));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(null); }
  }, [recharger]);

  const supprimerProduitAction = useCallback(async (id: string) => {
    setChargementAction(id);
    try {
      await supprimerProduit(id);
      setProduits((prev) => prev.filter((p) => p._id !== id));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(null); }
  }, [recharger]);

  return {
    produits, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre,
    approuverProduit, rejeterProduit,
    supprimerProduit: supprimerProduitAction,
    recharger,
  };
}
