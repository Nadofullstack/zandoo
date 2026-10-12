import { useEffect, useRef, useState } from 'react';

interface EtatChargement<T> {
  donnees: T | null;
  chargement: boolean;
  erreur: boolean;
}

/**
 * Charge une ressource asynchrone et la recharge à chaque changement de `cle`.
 *
 * - Les données précédentes restent affichées pendant un rechargement
 *   (pas de clignotement : seul le premier chargement montre un squelette).
 * - Les réponses obsolètes (changement de période rapide) sont ignorées.
 * - `recharger()` relance la requête sans changer la clé (bouton « Réessayer »).
 */
export function useChargement<T>(charger: () => Promise<T>, cle: string) {
  const [etat, setEtat] = useState<EtatChargement<T>>({ donnees: null, chargement: true, erreur: false });
  const [essai, setEssai] = useState(0);
  const chargerRef = useRef(charger);

  useEffect(() => {
    chargerRef.current = charger;
  });

  useEffect(() => {
    let annule = false;
    const executer = async () => {
      setEtat((e) => ({ ...e, chargement: true, erreur: false }));
      try {
        const donnees = await chargerRef.current();
        if (!annule) setEtat({ donnees, chargement: false, erreur: false });
      } catch {
        if (!annule) setEtat((e) => ({ ...e, chargement: false, erreur: true }));
      }
    };
    executer();
    return () => { annule = true; };
  }, [cle, essai]);

  return { ...etat, recharger: () => setEssai((n) => n + 1) };
}
