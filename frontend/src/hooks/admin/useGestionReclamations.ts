import { useState, useEffect, useCallback } from 'react';
import type {
  Reclamation,
  StatutReclamation,
  PrioriteReclamation,
  CategorieReclamation,
  StatistiquesReclamations,
  Pagination,
} from '../../types/admin';
import {
  getReclamations,
  getStatistiquesReclamations,
  modifierStatutReclamation,
  modifierPriorite,
  assignerReclamation,
} from '../../services/admin/adminReclamationService';

interface EtatFiltre {
  statut: StatutReclamation | '';
  priorite: PrioriteReclamation | '';
  categorie: CategorieReclamation | '';
  recherche: string;
  page: number;
}

interface EtatHook {
  reclamations: Reclamation[];
  pagination: Pagination | null;
  statistiques: StatistiquesReclamations | null;
  chargement: boolean;
  chargementAction: string | null;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  changerStatut: (id: string, statut: StatutReclamation, raison?: string) => Promise<void>;
  changerPriorite: (id: string, priorite: PrioriteReclamation) => Promise<void>;
  assigner: (id: string, adminId: string | null) => Promise<void>;
  recharger: () => void;
}

const FILTRE_INITIAL: EtatFiltre = {
  statut: '',
  priorite: '',
  categorie: '',
  recherche: '',
  page: 1,
};

export function useGestionReclamations(): EtatHook {
  const [reclamations,     setReclamations]     = useState<Reclamation[]>([]);
  const [pagination,       setPagination]       = useState<Pagination | null>(null);
  const [statistiques,     setStatistiques]     = useState<StatistiquesReclamations | null>(null);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [filtre,           setFiltreState]      = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteur,         setCompteur]         = useState(0);

  const setFiltre = useCallback((nouveauFiltre: Partial<EtatFiltre>) => {
    setFiltreState((prev) => ({ ...prev, ...nouveauFiltre, page: nouveauFiltre.page ?? 1 }));
  }, []);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  /* Chargement liste + statistiques */
  useEffect(() => {
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [reponseReclamations, reponseStats] = await Promise.all([
          getReclamations({
            statut:    filtre.statut    || undefined,
            priorite:  filtre.priorite  || undefined,
            categorie: filtre.categorie || undefined,
            recherche: filtre.recherche || undefined,
            page:      filtre.page,
          }),
          getStatistiquesReclamations(),
        ]);
        if (annule) return;
        setReclamations(reponseReclamations.data.reclamations);
        setPagination(reponseReclamations.data.pagination);
        setStatistiques(reponseStats.data.statistiques);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur lors du chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [filtre.statut, filtre.priorite, filtre.categorie, filtre.recherche, filtre.page, compteur]);

  const changerStatut = useCallback(async (
    id: string, statut: StatutReclamation, raison?: string
  ) => {
    setChargementAction(id);
    try {
      const rep = await modifierStatutReclamation(id, statut, raison);
      setReclamations((prev) => prev.map((r) => r._id === id ? rep.data.reclamation : r));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally { setChargementAction(null); }
  }, [recharger]);

  const changerPriorite = useCallback(async (id: string, priorite: PrioriteReclamation) => {
    setChargementAction(id);
    try {
      const rep = await modifierPriorite(id, priorite);
      setReclamations((prev) => prev.map((r) => r._id === id ? rep.data.reclamation : r));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
    } finally { setChargementAction(null); }
  }, []);

  const assigner = useCallback(async (id: string, adminId: string | null) => {
    setChargementAction(id);
    try {
      const rep = await assignerReclamation(id, adminId);
      setReclamations((prev) => prev.map((r) => r._id === id ? rep.data.reclamation : r));
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de l\'assignation.');
    } finally { setChargementAction(null); }
  }, []);

  return {
    reclamations, pagination, statistiques,
    chargement, chargementAction, erreur,
    filtre, setFiltre,
    changerStatut, changerPriorite, assigner,
    recharger,
  };
}
