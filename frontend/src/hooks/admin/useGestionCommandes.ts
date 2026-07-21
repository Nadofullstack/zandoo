import { useState, useEffect, useCallback } from 'react';
import type {
  Commande,
  StatutCommande,
  StatistiquesCommandes,
  Pagination,
} from '../../types/admin';
import {
  getCommandes,
  getStatistiquesCommandes,
  modifierStatutCommande,
} from '../../services/admin/adminCommandeService';

interface EtatFiltre {
  statut: StatutCommande | '';
  recherche: string;
  dateDebut: string;
  dateFin: string;
  page: number;
}

interface EtatHook {
  commandes: Commande[];
  pagination: Pagination | null;
  statistiques: StatistiquesCommandes | null;
  chargement: boolean;
  chargementStatut: string | null;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  changerStatut: (id: string, statut: StatutCommande, raison?: string) => Promise<void>;
  recharger: () => void;
}

const FILTRE_INITIAL: EtatFiltre = {
  statut: '',
  recherche: '',
  dateDebut: '',
  dateFin: '',
  page: 1,
};

export function useGestionCommandes(): EtatHook {
  const [commandes,          setCommandes]          = useState<Commande[]>([]);
  const [pagination,         setPagination]         = useState<Pagination | null>(null);
  const [statistiques,       setStatistiques]       = useState<StatistiquesCommandes | null>(null);
  const [chargement,         setChargement]         = useState(true);
  const [chargementStatut,   setChargementStatut]   = useState<string | null>(null);
  const [erreur,             setErreur]             = useState<string | null>(null);
  const [filtre,             setFiltreState]        = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteurRechargement, setCompteurRechargement] = useState(0);

  const setFiltre = useCallback((nouveauFiltre: Partial<EtatFiltre>) => {
    setFiltreState((prev) => ({
      ...prev,
      ...nouveauFiltre,
      page: nouveauFiltre.page ?? 1,
    }));
  }, []);

  const recharger = useCallback(() => {
    setCompteurRechargement((n) => n + 1);
  }, []);

  /* Chargement liste + statistiques */
  useEffect(() => {
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);

      try {
        const [reponseCommandes, reponseStats] = await Promise.all([
          getCommandes({
            statut:    filtre.statut || undefined,
            recherche: filtre.recherche || undefined,
            dateDebut: filtre.dateDebut || undefined,
            dateFin:   filtre.dateFin   || undefined,
            page:      filtre.page,
          }),
          getStatistiquesCommandes(),
        ]);

        if (annule) return;

        setCommandes(reponseCommandes.data.commandes);
        setPagination(reponseCommandes.data.pagination);
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
  }, [filtre.statut, filtre.recherche, filtre.dateDebut, filtre.dateFin, filtre.page, compteurRechargement]);

  /* Changer le statut d'une commande */
  const changerStatut = useCallback(async (
    id: string,
    statut: StatutCommande,
    raison?: string
  ) => {
    setChargementStatut(id);
    try {
      const reponse = await modifierStatutCommande(id, statut, raison);
      setCommandes((prev) =>
        prev.map((c) => (c._id === id ? reponse.data.commande : c))
      );
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally {
      setChargementStatut(null);
    }
  }, [recharger]);

  return {
    commandes,
    pagination,
    statistiques,
    chargement,
    chargementStatut,
    erreur,
    filtre,
    setFiltre,
    changerStatut,
    recharger,
  };
}
