import { useState, useEffect, useCallback } from 'react';
import type { Vendeur, StatutVendeur } from '../types/admin';
import {
  getVendeurParId,
  modifierStatutVendeur,
  modifierNotesAdmin,
} from '../services/adminVendeurService';

interface EtatHook {
  vendeur: Vendeur | null;
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  messageSucces: string | null;
  changerStatut: (statut: StatutVendeur, raison?: string) => Promise<void>;
  sauvegarderNotes: (notes: string) => Promise<void>;
}

export function useProfilVendeur(id: string): EtatHook {
  const [vendeur, setVendeur] = useState<Vendeur | null>(null);
  const [chargement, setChargement] = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  /* Chargement initial du profil */
  useEffect(() => {
    if (!id) return;
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const reponse = await getVendeurParId(id);
        if (!annule) setVendeur(reponse.data.vendeur);
      } catch (err) {
        if (!annule) {
          setErreur(err instanceof Error ? err.message : 'Impossible de charger le profil.');
        }
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [id]);

  /* Affiche un message de succès temporaire (3 secondes) */
  const afficherSucces = useCallback((message: string) => {
    setMessageSucces(message);
    setTimeout(() => setMessageSucces(null), 3000);
  }, []);

  /* Changer le statut du vendeur */
  const changerStatut = useCallback(async (statut: StatutVendeur, raison?: string) => {
    setChargementAction(true);
    setErreur(null);
    try {
      const reponse = await modifierStatutVendeur(id, statut, raison);
      setVendeur(reponse.data.vendeur);
      const libelle = statut === 'approuve' ? 'approuvé' : statut === 'suspendu' ? 'suspendu' : 'remis en attente';
      afficherSucces(`Vendeur ${libelle} avec succès.`);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors du changement de statut.');
    } finally {
      setChargementAction(false);
    }
  }, [id, afficherSucces]);

  /* Sauvegarder les notes admin */
  const sauvegarderNotes = useCallback(async (notes: string) => {
    setChargementAction(true);
    setErreur(null);
    try {
      const reponse = await modifierNotesAdmin(id, notes);
      setVendeur(reponse.data.vendeur);
      afficherSucces('Notes sauvegardées.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setChargementAction(false);
    }
  }, [id, afficherSucces]);

  return {
    vendeur,
    chargement,
    chargementAction,
    erreur,
    messageSucces,
    changerStatut,
    sauvegarderNotes,
  };
}
