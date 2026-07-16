import { useState, useEffect, useCallback } from 'react';
import type { UtilisateurAdmin, RoleUtilisateur, StatistiquesUtilisateurs, Pagination, FormulaireUtilisateur } from '../types/admin';
import {
  getUtilisateurs,
  getStatistiquesUtilisateurs,
  modifierStatutUtilisateur,
  supprimerUtilisateur,
} from '../services/adminUtilisateurService';

interface EtatFiltre {
  role: RoleUtilisateur | '';
  actif: 'true' | 'false' | '';
  recherche: string;
  dateDebut: string;
  dateFin: string;
  page: number;
}

const FILTRE_INITIAL: EtatFiltre = {
  role: '', actif: '', recherche: '', dateDebut: '', dateFin: '', page: 1,
};

interface EtatHook {
  utilisateurs: UtilisateurAdmin[];
  pagination: Pagination | null;
  statistiques: StatistiquesUtilisateurs | null;
  chargement: boolean;
  chargementAction: string | null;
  erreur: string | null;
  filtre: EtatFiltre;
  setFiltre: (f: Partial<EtatFiltre>) => void;
  activerUtilisateur: (id: string) => Promise<void>;
  suspendreUtilisateur: (id: string) => Promise<void>;
  supprimerUtilisateur: (id: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionUtilisateurs(): EtatHook {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurAdmin[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statistiques, setStatistiques] = useState<StatistiquesUtilisateurs | null>(null);
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
        const [repUsers, repStats] = await Promise.all([
          getUtilisateurs({
            role:      filtre.role      || undefined,
            actif:     filtre.actif     || undefined,
            recherche: filtre.recherche || undefined,
            dateDebut: filtre.dateDebut || undefined,
            dateFin:   filtre.dateFin   || undefined,
            page:      filtre.page,
          }),
          getStatistiquesUtilisateurs(),
        ]);
        if (annule) return;
        setUtilisateurs(repUsers.data.utilisateurs);
        setPagination(repUsers.data.pagination);
        setStatistiques(repStats.data.statistiques);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [filtre.role, filtre.actif, filtre.recherche, filtre.dateDebut, filtre.dateFin, filtre.page, compteur]);

  const changerStatut = useCallback(async (id: string, isActive: boolean) => {
    setChargementAction(id);
    try {
      const rep = await modifierStatutUtilisateur(id, isActive);
      setUtilisateurs((prev) => prev.map((u) => (u._id === id ? rep.data.utilisateur : u)));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(null); }
  }, [recharger]);

  const supprimerAction = useCallback(async (id: string) => {
    setChargementAction(id);
    try {
      await supprimerUtilisateur(id);
      setUtilisateurs((prev) => prev.filter((u) => u._id !== id));
      recharger();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur.');
    } finally { setChargementAction(null); }
  }, [recharger]);

  return {
    utilisateurs, pagination, statistiques, chargement, chargementAction, erreur,
    filtre, setFiltre,
    activerUtilisateur:   (id) => changerStatut(id, true),
    suspendreUtilisateur: (id) => changerStatut(id, false),
    supprimerUtilisateur: supprimerAction,
    recharger,
  };
}
