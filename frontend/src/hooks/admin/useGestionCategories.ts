import { useState, useEffect, useCallback } from 'react';
import type { Categorie } from '../../types/admin';
import {
  getCategories,
  creerCategorie,
  modifierCategorie,
  supprimerCategorie,
} from '../../services/admin/adminCategorieService';

interface EtatHook {
  categories: Categorie[];
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  messageSucces: string | null;
  creer: (donnees: Partial<Categorie>) => Promise<Categorie | null>;
  modifier: (id: string, donnees: Partial<Categorie>) => Promise<Categorie | null>;
  supprimer: (id: string) => Promise<boolean>;
  recharger: () => void;
}

export function useGestionCategories(): EtatHook {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);
  const [compteur, setCompteur] = useState(0);

  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  const afficherSucces = useCallback((msg: string) => {
    setMessageSucces(msg);
    setTimeout(() => setMessageSucces(null), 3000);
  }, []);

  useEffect(() => {
    let annule = false;
    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const rep = await getCategories();
        if (!annule) setCategories(rep.data.categories);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Erreur de chargement.');
      } finally {
        if (!annule) setChargement(false);
      }
    };
    charger();
    return () => { annule = true; };
  }, [compteur]);

  const creer = useCallback(async (donnees: Partial<Categorie>): Promise<Categorie | null> => {
    setChargementAction(true);
    setErreur(null);
    try {
      const rep = await creerCategorie(donnees);
      afficherSucces('Catégorie créée avec succès.');
      recharger();
      return rep.data.categorie;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de création.');
      return null;
    } finally { setChargementAction(false); }
  }, [afficherSucces, recharger]);

  const modifier = useCallback(async (id: string, donnees: Partial<Categorie>): Promise<Categorie | null> => {
    setChargementAction(true);
    setErreur(null);
    try {
      const rep = await modifierCategorie(id, donnees);
      afficherSucces('Catégorie mise à jour.');
      recharger();
      return rep.data.categorie;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de modification.');
      return null;
    } finally { setChargementAction(false); }
  }, [afficherSucces, recharger]);

  const supprimer = useCallback(async (id: string): Promise<boolean> => {
    setChargementAction(true);
    setErreur(null);
    try {
      await supprimerCategorie(id);
      afficherSucces('Catégorie supprimée.');
      recharger();
      return true;
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur de suppression.');
      return false;
    } finally { setChargementAction(false); }
  }, [afficherSucces, recharger]);

  return { categories, chargement, chargementAction, erreur, messageSucces, creer, modifier, supprimer, recharger };
}
