import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ajouterFavori, getIdsFavoris, retirerFavori } from '../services/acheteur/acheteurFavoriService';
import { lireSession } from '../services/auth/authService';

interface ContexteFavoris {
  /** true si le produit est dans les favoris de l'utilisateur */
  estFavori: (produitId: string) => boolean;
  /** Ajoute ou retire (mise à jour optimiste, annulée en cas d'échec). Renvoie le nouvel état. */
  basculer: (produitId: string) => Promise<boolean>;
  nombre: number;
}

const FavorisContext = createContext<ContexteFavoris | null>(null);

/**
 * État global des favoris : l'ensemble des identifiants est chargé une fois,
 * puis chaque carte produit lit son état sans requête supplémentaire.
 */
export function FavorisProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const estConnecte = !!lireSession();

  useEffect(() => {
    if (!estConnecte) return;
    let annule = false;
    getIdsFavoris()
      .then((liste) => { if (!annule) setIds(new Set(liste)); })
      .catch(() => { /* non bloquant : les cœurs restent vides */ });
    return () => { annule = true; };
  }, [estConnecte]);

  const estFavori = useCallback((produitId: string) => ids.has(produitId), [ids]);

  const basculer = useCallback(async (produitId: string) => {
    if (!lireSession()) {
      navigate('/connexion', { state: { from: window.location.pathname + window.location.search } });
      return false;
    }

    const etaitFavori = ids.has(produitId);
    const appliquer = (favori: boolean) =>
      setIds((prec) => {
        const suivant = new Set(prec);
        if (favori) suivant.add(produitId); else suivant.delete(produitId);
        return suivant;
      });

    appliquer(!etaitFavori);
    try {
      if (etaitFavori) await retirerFavori(produitId); else await ajouterFavori(produitId);
      return !etaitFavori;
    } catch {
      appliquer(etaitFavori); // annulation de la mise à jour optimiste
      return etaitFavori;
    }
  }, [ids, navigate]);

  return (
    <FavorisContext.Provider value={{ estFavori, basculer, nombre: estConnecte ? ids.size : 0 }}>
      {children}
    </FavorisContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavoris(): ContexteFavoris {
  const ctx = useContext(FavorisContext);
  if (!ctx) throw new Error('useFavoris doit être utilisé dans <FavorisProvider>.');
  return ctx;
}
