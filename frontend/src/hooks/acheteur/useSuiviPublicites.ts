import { useCallback, useEffect, useRef } from 'react';
import { signalerClic, signalerImpressions } from '../../services/acheteur/acheteurPubliciteService';

const CLE_SESSION = 'zandoo.publicites.vues';
const DELAI_LOT_MS = 1500;

/** Campagnes déjà comptées pendant cette session de navigation */
const lireVues = (): Set<string> => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(CLE_SESSION) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
};

const enregistrerVues = (vues: Set<string>) => {
  try { sessionStorage.setItem(CLE_SESSION, JSON.stringify([...vues])); } catch { /* stockage indisponible */ }
};

/**
 * Mesure d'audience des campagnes :
 *  - une impression par campagne et par session, envoyée par lots ;
 *  - un clic à chaque activation.
 */
export function useSuiviPublicites() {
  const enAttente = useRef<Set<string>>(new Set());
  const minuteur  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vider = useCallback(() => {
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = null;
    const ids = [...enAttente.current];
    enAttente.current.clear();
    signalerImpressions(ids);
  }, []);

  /* Envoi du lot restant si l'utilisateur quitte la page ou change d'onglet */
  useEffect(() => {
    const surMasquage = () => { if (document.visibilityState === 'hidden') vider(); };
    document.addEventListener('visibilitychange', surMasquage);
    return () => {
      document.removeEventListener('visibilitychange', surMasquage);
      vider();
    };
  }, [vider]);

  const marquerVue = useCallback((id: string) => {
    const vues = lireVues();
    if (vues.has(id) || enAttente.current.has(id)) return;
    vues.add(id);
    enregistrerVues(vues);
    enAttente.current.add(id);
    if (!minuteur.current) minuteur.current = setTimeout(vider, DELAI_LOT_MS);
  }, [vider]);

  const marquerClic = useCallback((id: string) => signalerClic(id), []);

  return { marquerVue, marquerClic };
}
