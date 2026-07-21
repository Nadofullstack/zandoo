import { useState, useEffect, useCallback } from 'react';
import type { Livreur, StatutLivreur, StatistiquesLivreurs, Pagination } from '../../types/admin';
import {
  getLivreurs,
  getStatistiquesLivreurs,
  modifierStatutLivreur,
  supprimerLivreur,
  renvoyerInvitationLivreur,
} from '../../services/admin/adminLivreurService';

interface EtatFiltre {
  statut: StatutLivreur | '';
  recherche: string;
  page: number;
}

const FILTRE_INITIAL: EtatFiltre = { statut: '', recherche: '', page: 1 };

interface EtatHook {
  livreurs: Livreur[];
  pagination: Pagination | null;
  statistiques: StatistiquesLivreurs | null;
  chargement: boolean;
  chargementAction: string | null;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  activerLivreur: (id: string, raison?: string) => Promise<void>;
  suspendreLivreur: (id: string, raison?: string) => Promise<void>;
  supprimerLivreur: (id: string) => Promise<void>;
  renvoyerInvitation: (id: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionLivreurs(): EtatHook {
  const [livreurs, setLivreurs]           = useState<Livreur[]>([]);
  const [pagination, setPagination]       = useState<Pagination | null>(null);
  const [statistiques, setStatistiques]   = useState<StatistiquesLivreurs | null>(null);
  const [chargement, setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
  const [erreur, setErreur]               = useState<string | null>(null);
  const [filtre, setFiltreState]          = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteur, setCompteur]           = useState(0);

  const setFiltre = useCallback((f: Partial<EtatFiltre>) => {
    setFiltreState((prev) => ({ ...prev, ...f, page: f.page ?? 1 }));
  }, []);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  /* Chargement liste + statistiques */
  useEffect(() => {
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [repLivreurs, repStats] = await Promise.all([
          getLivreurs({
            statut:    filtre.statut    || undefined,
            recherche: filtre.recherche || undefined,
            page:      filtre.page,
          }),
          getStatistiquesLivreurs(),
        ]);
        if (annule) return;
        setLivreurs(repLivreurs.data.livreurs);
        setPagination(repLivreurs.data.pagination);
        setStatistiques(repStats.data.statistiques);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [filtre.statut, filtre.recherche, filtre.page, compteur]);

  /* Changer le statut d'un livreur */
  const changerStatut = useCallback(
    async (id: string, statut: StatutLivreur, raison?: string) => {
      setChargementAction(id);
      try {
        const rep = await modifierStatutLivreur(id, statut, raison);
        setLivreurs((prev) => prev.map((l) => (l._id === id ? rep.data.livreur : l)));
        recharger();
      } catch (err) {
        setErreur(err instanceof Error ? err.message : 'Erreur.');
      } finally {
        setChargementAction(null);
      }
    },
    [recharger]
  );

  /* Supprimer un livreur */
  const supprimerAction = useCallback(async (id: string) => {
    setChargementAction(id);
    try {
      await supprimerLivreur(id);
      setLivreurs((prev) => prev.filter((l) => l._id !== id));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setChargementAction(null);
    }
  }, [recharger]);

  /* Renvoyer l'email d'invitation */
  const renvoyerInvitationAction = useCallback(async (id: string) => {
    setChargementAction(id);
    try {
      await renvoyerInvitationLivreur(id);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors du renvoi de l\'invitation.');
    } finally {
      setChargementAction(null);
    }
  }, []);

  return {
    livreurs,
    pagination,
    statistiques,
    chargement,
    chargementAction,
    erreur,
    filtre,
    setFiltre,
    activerLivreur:     (id, raison) => changerStatut(id, 'actif', raison),
    suspendreLivreur:   (id, raison) => changerStatut(id, 'suspendu', raison),
    supprimerLivreur:   supprimerAction,
    renvoyerInvitation: renvoyerInvitationAction,
    recharger,
  };
}
