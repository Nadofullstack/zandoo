import { useState, useEffect, useCallback } from 'react';
import type { Vendeur, StatutVendeur, StatistiquesVendeurs, Pagination } from '../types/admin';
import {
  getVendeurs,
  getStatistiquesVendeurs,
  modifierStatutVendeur,
} from '../services/adminVendeurService';

interface EtatFiltre {
  statut: StatutVendeur | '';
  recherche: string;
  page: number;
}

interface EtatHook {
  vendeurs: Vendeur[];
  pagination: Pagination | null;
  statistiques: StatistiquesVendeurs | null;
  chargement: boolean;
  chargementStatut: string | null; // ID du vendeur en cours de mise à jour
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  approuverVendeur: (id: string, raison?: string) => Promise<void>;
  suspendreVendeur: (id: string, raison?: string) => Promise<void>;
  recharger: () => void;
}

const FILTRE_INITIAL: EtatFiltre = { statut: '', recherche: '', page: 1 };

export function useGestionVendeurs(): EtatHook {
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statistiques, setStatistiques] = useState<StatistiquesVendeurs | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementStatut, setChargementStatut] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltreState] = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteurRechargement, setCompteurRechargement] = useState(0);

  const setFiltre = useCallback((nouveauFiltre: Partial<EtatFiltre>) => {
    setFiltreState((prev) => ({
      ...prev,
      ...nouveauFiltre,
      /* Réinitialise la page si on change le filtre ou la recherche */
      page: nouveauFiltre.page ?? 1,
    }));
  }, []);

  const recharger = useCallback(() => {
    setCompteurRechargement((n) => n + 1);
  }, []);

  /* Chargement de la liste + statistiques */
  useEffect(() => {
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);

      try {
        const [reponseVendeurs, reponseStats] = await Promise.all([
          getVendeurs({
            statut:     filtre.statut || undefined,
            recherche:  filtre.recherche || undefined,
            page:       filtre.page,
          }),
          getStatistiquesVendeurs(),
        ]);

        if (annule) return;

        setVendeurs(reponseVendeurs.data.vendeurs);
        setPagination(reponseVendeurs.data.pagination);
        setStatistiques(reponseStats.data.statistiques);
      } catch (err) {
        if (!annule) {
          setErreur(err instanceof Error ? err.message : 'Erreur lors du chargement.');
        }
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [filtre.statut, filtre.recherche, filtre.page, compteurRechargement]);

  /* Approuver un vendeur */
  const approuverVendeur = useCallback(async (id: string, raison?: string) => {
    setChargementStatut(id);
    try {
      const reponse = await modifierStatutVendeur(id, 'approuve', raison);
      setVendeurs((prev) =>
        prev.map((v) => (v._id === id ? reponse.data.vendeur : v))
      );
      recharger(); // recharge les stats
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'approbation.');
    } finally {
      setChargementStatut(null);
    }
  }, [recharger]);

  /* Suspendre un vendeur */
  const suspendreVendeur = useCallback(async (id: string, raison?: string) => {
    setChargementStatut(id);
    try {
      const reponse = await modifierStatutVendeur(id, 'suspendu', raison);
      setVendeurs((prev) =>
        prev.map((v) => (v._id === id ? reponse.data.vendeur : v))
      );
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suspension.');
    } finally {
      setChargementStatut(null);
    }
  }, [recharger]);

  return {
    vendeurs,
    pagination,
    statistiques,
    chargement,
    chargementStatut,
    erreur,
    filtre,
    setFiltre,
    approuverVendeur,
    suspendreVendeur,
    recharger,
  };
}
