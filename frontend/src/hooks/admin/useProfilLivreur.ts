import { useState, useEffect, useCallback } from 'react';
import type { Livreur, StatutLivreur } from '../../types/admin';
import {
  getLivreurParId,
  modifierStatutLivreur,
  renvoyerInvitationLivreur,
} from '../../services/admin/adminLivreurService';

interface EtatHook {
  livreur: Livreur | null;
  chargement: boolean;
  chargementAction: boolean;
  erreur: string | null;
  messageSucces: string | null;
  changerStatut: (statut: StatutLivreur, raison?: string) => Promise<void>;
  renvoyerInvitation: () => Promise<void>;
}

export function useProfilLivreur(id: string): EtatHook {
  const [livreur, setLivreur]         = useState<Livreur | null>(null);
  const [chargement, setChargement]   = useState(true);
  const [chargementAction, setChargementAction] = useState(false);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  /* Chargement initial */
  useEffect(() => {
    if (!id) return;
    let annule = false;

    const charger = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const rep = await getLivreurParId(id);
        if (!annule) setLivreur(rep.data.livreur);
      } catch (err) {
        if (!annule) setErreur(err instanceof Error ? err.message : 'Impossible de charger le profil.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [id]);

  /** Affiche un message de succès temporaire (3 s) */
  const afficherSucces = useCallback((message: string) => {
    setMessageSucces(message);
    setTimeout(() => setMessageSucces(null), 3000);
  }, []);

  /** Change le statut du livreur */
  const changerStatut = useCallback(
    async (statut: StatutLivreur, raison?: string) => {
      setChargementAction(true);
      setErreur(null);
      try {
        const rep = await modifierStatutLivreur(id, statut, raison);
        setLivreur(rep.data.livreur);
        const libelle =
          statut === 'actif'     ? 'activé' :
          statut === 'suspendu'  ? 'suspendu' :
                                   'remis en attente';
        afficherSucces(`Livreur ${libelle} avec succès.`);
      } catch (err) {
        setErreur(err instanceof Error ? err.message : 'Erreur lors du changement de statut.');
      } finally {
        setChargementAction(false);
      }
    },
    [id, afficherSucces]
  );

  /** Renvoie l'email d'invitation */
  const renvoyerInvitation = useCallback(async () => {
    setChargementAction(true);
    setErreur(null);
    try {
      await renvoyerInvitationLivreur(id);
      afficherSucces('Email d\'invitation renvoyé avec succès.');
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur lors du renvoi de l\'invitation.');
    } finally {
      setChargementAction(false);
    }
  }, [id, afficherSucces]);

  return {
    livreur,
    chargement,
    chargementAction,
    erreur,
    messageSucces,
    changerStatut,
    renvoyerInvitation,
  };
}
