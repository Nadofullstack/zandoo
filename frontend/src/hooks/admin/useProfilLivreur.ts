import { useState, useEffect } from 'react';
import type { Livreur } from '../../types/admin';
import { getLivreurParId } from '../../services/admin/adminLivreurService';

interface EtatHook {
  livreur: Livreur | null;
  chargement: boolean;
  erreur: string | null;
}

export function useProfilLivreur(id: string): EtatHook {
  const [livreur, setLivreur]       = useState<Livreur | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);

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
        if (!annule)
          setErreur(err instanceof Error ? err.message : 'Impossible de charger le profil.');
      } finally {
        if (!annule) setChargement(false);
      }
    };

    charger();
    return () => { annule = true; };
  }, [id]);

  return { livreur, chargement, erreur };
}
