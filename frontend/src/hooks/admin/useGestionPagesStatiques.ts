import { useState, useEffect, useCallback } from 'react';
import type { PageStatique, FormulairePageStatique } from '../../types/admin';
import { getPages, creerPage, modifierPage, supprimerPage } from '../../services/admin/adminPageStatiqueService';

interface EtatHook {
  pages: PageStatique[];
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  creer: (d: Partial<FormulairePageStatique>) => Promise<PageStatique | null>;
  modifier: (id: string, d: Partial<FormulairePageStatique>) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
  recharger: () => void;
}

export function useGestionPagesStatiques(): EtatHook {
  const [pages,            setPages]            = useState<PageStatique[]>([]);
  const [chargement,       setChargement]       = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur,           setErreur]           = useState<string | null>(null);
  const [compteur,         setCompteur]         = useState(0);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true); setErreur(null);
      try {
        const rep = await getPages();
        if (!annule) setPages(rep.data.pages);
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : 'Erreur de chargement.');
      } finally { if (!annule) setChargement(false); }
    };
    charger();
    return () => { annule = true; };
  }, [compteur]);

  const creer = useCallback(async (d: Partial<FormulairePageStatique>) => {
    setChargementAction(true);
    try {
      const rep = await creerPage(d);
      recharger();
      return rep.data.page;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.'); return null;
    } finally { setChargementAction(false); }
  }, [recharger]);

  const modifier = useCallback(async (id: string, d: Partial<FormulairePageStatique>) => {
    setChargementAction(true);
    try {
      const rep = await modifierPage(id, d);
      setPages((prev) => prev.map((p) => p._id === id ? rep.data.page : p));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setChargementAction(false); }
  }, []);

  const supprimer = useCallback(async (id: string) => {
    setChargementAction(true);
    try {
      await supprimerPage(id);
      setPages((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Erreur.');
    } finally { setChargementAction(false); }
  }, []);

  return { pages, chargement, chargementAction, erreur, creer, modifier, supprimer, recharger };
}
