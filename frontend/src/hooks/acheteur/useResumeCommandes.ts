import { useEffect, useState } from 'react';
import { getResumeCommandes } from '../../services/acheteur/acheteurCommandeService';
import type { ResumeCommandes } from '../../types/acheteur';

/**
 * Chiffres clés des commandes de l'acheteur (page « Mon compte »).
 * `actif` à false (utilisateur non connecté) : aucune requête n'est envoyée.
 */
export function useResumeCommandes(actif = true) {
  const [resume, setResume] = useState<ResumeCommandes | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!actif) return;
    let annule = false;
    getResumeCommandes()
      .then(({ data }) => { if (!annule) setResume(data); })
      .catch(() => { if (!annule) setErreur(true); });
    return () => { annule = true; };
  }, [actif]);

  return { resume, erreur };
}
