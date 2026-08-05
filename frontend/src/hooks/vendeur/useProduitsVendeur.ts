import { useState, useEffect, useCallback } from 'react';
import {
  getMesProduits,
  getStatistiquesProduits,
  supprimerProduitVendeur,
  mettreAJourStock,
  modifierStatutProduit,
} from '../../services/vendeur/vendeurService';
import type { ProduitVendeur, StatistiquesProduits } from '../../types/vendeur';

interface Filtre {
  recherche: string;
  statut: string;
  page: number;
}

const FILTRE_INIT: Filtre = { recherche: '', statut: '', page: 1 };
const LIMITE = 20;

export function useProduitsVendeur() {
  const [produits, setProduits]           = useState<ProduitVendeur[]>([]);
  const [statistiques, setStatistiques]   = useState<StatistiquesProduits | null>(null);
  const [pagination, setPagination]       = useState<{ total: number; page: number; totalPages: number; limite: number } | null>(null);
  const [filtre, setFiltreState]          = useState<Filtre>(FILTRE_INIT);
  const [chargement, setChargement]       = useState(true);
  const [erreur, setErreur]               = useState<string | null>(null);

  const charger = useCallback(async (f: Filtre) => {
    setChargement(true);
    setErreur(null);
    try {
      const [repProduits, repStats] = await Promise.all([
        getMesProduits({ page: f.page, limite: LIMITE, statut: f.statut || undefined, recherche: f.recherche || undefined }),
        getStatistiquesProduits(),
      ]);
      setProduits(repProduits.data.produits);
      setPagination(repProduits.data.pagination);
      setStatistiques(repStats.data.statistiques);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(filtre); }, [filtre, charger]);

  const setFiltre = (partiel: Partial<Filtre>) =>
    setFiltreState((prev) => ({ ...prev, ...partiel }));

  const supprimerProduit = async (id: string) => {
    try {
      await supprimerProduitVendeur(id);
      charger(filtre);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    }
  };

  const mettreAJourStockProduit = async (id: string, quantite: number) => {
    try {
      const rep = await mettreAJourStock(id, quantite);
      setProduits((prev) => prev.map((p) => (p._id === id ? { ...p, ...rep.data.produit } : p)));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur mise à jour stock.');
    }
  };

  const changerStatutProduit = async (id: string, statut: 'en_stock' | 'faible' | 'en_rupture') => {
    try {
      const rep = await modifierStatutProduit(id, statut);
      setProduits((prev) => prev.map((p) => (p._id === id ? { ...p, ...rep.data.produit } : p)));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur mise à jour statut.');
    }
  };

  return {
    produits, statistiques, pagination, filtre, chargement, erreur,
    setFiltre, supprimerProduit, mettreAJourStockProduit, changerStatutProduit,
    rafraichir: () => charger(filtre),
  };
}
