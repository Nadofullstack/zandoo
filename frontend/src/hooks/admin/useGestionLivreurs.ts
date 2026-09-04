import { useState, useEffect, useCallback } from 'react';
import type { Livreur, StatutLivreur, StatistiquesLivreurs, Pagination } from '../../types/admin';
import {
  getLivreurs,
  getStatistiquesLivreurs,
  supprimerLivreur,
} from '../../services/admin/adminLivreurService';
import { getVendeurs } from '../../services/admin/adminVendeurService';

export interface OptionBoutique {
  _id: string;
  nomEntreprise: string;
}

interface EtatFiltre {
  statut: StatutLivreur | '';
  vendeurId: string;
  recherche: string;
  page: number;
}

const FILTRE_INITIAL: EtatFiltre = { statut: '', vendeurId: '', recherche: '', page: 1 };

interface EtatHook {
  livreurs: Livreur[];
  pagination: Pagination | null;
  statistiques: StatistiquesLivreurs | null;
  boutiques: OptionBoutique[];
  chargement: boolean;
  chargementAction: string | null;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  supprimerLivreur: (id: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionLivreurs(): EtatHook {
  const [livreurs, setLivreurs]         = useState<Livreur[]>([]);
  const [pagination, setPagination]     = useState<Pagination | null>(null);
  const [statistiques, setStatistiques] = useState<StatistiquesLivreurs | null>(null);
  const [boutiques, setBoutiques]       = useState<OptionBoutique[]>([]);
  const [chargement, setChargement]     = useState(true);
  const [chargementAction, setChargementAction] = useState<string | null>(null);
  const [erreur, setErreur]             = useState<string | null>(null);
  const [filtre, setFiltreState]        = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteur, setCompteur]         = useState(0);

  const setFiltre = useCallback((f: Partial<EtatFiltre>) => {
    setFiltreState((prev) => ({ ...prev, ...f, page: f.page ?? 1 }));
  }, []);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  /* Chargement une seule fois : liste des boutiques approuvées pour le filtre */
  useEffect(() => {
    getVendeurs({ statut: 'approuve', limite: 200 })
      .then((rep) => {
        const options = rep.data.vendeurs.map((v: any) => ({
          _id:          v._id,
          nomEntreprise: v.nomEntreprise,
        }));
        setBoutiques(options);
      })
      .catch(() => {/* non bloquant */});
  }, []);

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
            vendeurId: filtre.vendeurId || undefined,
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
  }, [filtre.statut, filtre.vendeurId, filtre.recherche, filtre.page, compteur]);

  /* Supprimer un livreur */
  const supprimerAction = useCallback(async (id: string) => {
    setChargementAction(id);
    try {
      await supprimerLivreur(id);
      setLivreurs((prev) => prev.filter((l) => l._id !== id));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setChargementAction(null);
    }
  }, [recharger]);

  return {
    livreurs,
    pagination,
    statistiques,
    boutiques,
    chargement,
    chargementAction,
    erreur,
    filtre,
    setFiltre,
    supprimerLivreur: supprimerAction,
    recharger,
  };
}
