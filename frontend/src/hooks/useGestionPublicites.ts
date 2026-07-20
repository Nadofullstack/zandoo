import { useState, useEffect, useCallback } from 'react';
import type {
  Publicite, StatistiquesPublicites, StatutPublicite,
  TypePublicite, EmplacementPublicite, Pagination, FormulairePublicite,
} from '../types/admin';
import {
  getPublicites, getStatistiquesPublicites,
  creerPublicite, modifierPublicite, supprimerPublicite,
} from '../services/adminPubliciteService';

interface EtatFiltre {
  statut: StatutPublicite | '';
  type: TypePublicite | '';
  emplacement: EmplacementPublicite | '';
  page: number;
}

interface EtatHook {
  publicites: Publicite[];
  pagination: Pagination | null;
  statistiques: StatistiquesPublicites | null;
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  creer: (d: Partial<FormulairePublicite>) => Promise<Publicite | null>;
  modifier: (id: string, d: Partial<FormulairePublicite>) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
  recharger: () => void;
}

const FILTRE_INITIAL: EtatFiltre = { statut: '', type: '', emplacement: '', page: 1 };

export function useGestionPublicites(): EtatHook {
  const [publicites,       setPublicites]       = useState<Publicite[]>([]);
  const [pagination,       setPagination]       = useState<Pagination | null>(null);
  const [statistiques,     setStatistiques]     = useState<StatistiquesPublicites | null>(null);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [filtre,           setFiltreState]      = useState<EtatFiltre>(FILTRE_INITIAL);
  const [compteur,         setCompteur]         = useState(0);

  const setFiltre   = useCallback((f: Partial<EtatFiltre>) =>
    setFiltreState((p) => ({ ...p, ...f, page: f.page ?? 1 })), []);
  const recharger   = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true); setErreur(null);
      try {
        const [repPub, repStats] = await Promise.all([
          getPublicites({ statut: filtre.statut || undefined, type: filtre.type || undefined,
                          emplacement: filtre.emplacement || undefined, page: filtre.page }),
          getStatistiquesPublicites(),
        ]);
        if (annule) return;
        setPublicites(repPub.data.publicites);
        setPagination(repPub.data.pagination);
        setStatistiques(repStats.data.statistiques);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Erreur de chargement.');
      } finally { if (!annule) setChargement(false); }
    };
    charger();
    return () => { annule = true; };
  }, [filtre.statut, filtre.type, filtre.emplacement, filtre.page, compteur]);

  const creer = useCallback(async (d: Partial<FormulairePublicite>) => {
    setChargementAction(true);
    try {
      const rep = await creerPublicite(d);
      recharger();
      return rep.data.publicite;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.'); return null;
    } finally { setChargementAction(false); }
  }, [recharger]);

  const modifier = useCallback(async (id: string, d: Partial<FormulairePublicite>) => {
    setChargementAction(true);
    try {
      const rep = await modifierPublicite(id, d);
      setPublicites((prev) => prev.map((p) => p._id === id ? rep.data.publicite : p));
      recharger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setChargementAction(false); }
  }, [recharger]);

  const supprimer = useCallback(async (id: string) => {
    setChargementAction(true);
    try {
      await supprimerPublicite(id);
      setPublicites((prev) => prev.filter((p) => p._id !== id));
      recharger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setChargementAction(false); }
  }, [recharger]);

  return { publicites, pagination, statistiques, chargement, chargementAction,
           erreur, filtre, setFiltre, creer, modifier, supprimer, recharger };
}
