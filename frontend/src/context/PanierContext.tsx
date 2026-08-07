import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { Panier, LignePanier } from '../types/acheteur';
import {
  getPanier,
  ajouterAuPanier as apiAjouter,
  modifierQuantite as apiModifier,
  retirerDuPanier as apiRetirer,
  viderPanier as apiVider,
} from '../services/acheteur/acheteurPanierService';
import { lireSession } from '../services/auth/authService';

/* ──────────────────────────────────────────────────────────────────────────── */
/* Types                                                                         */
/* ──────────────────────────────────────────────────────────────────────────── */

interface EtatPanier {
  panier: Panier | null;
  chargement: boolean;
  /** Message d'erreur ou de succès pour le feedback utilisateur */
  notification: { type: 'succes' | 'erreur'; message: string } | null;
  /** Ouvre ou ferme le tiroir panier */
  panierOuvert: boolean;
  /** Ensemble des ligneId en cours de chargement (quantité / suppression) */
  lignesEnChargement: Set<string>;
}

interface ActionsPanier {
  chargerPanier: () => Promise<void>;
  ajouterAuPanier: (produitId: string, quantite?: number, variante?: string) => Promise<boolean>;
  modifierQuantite: (ligneId: string, quantite: number) => Promise<void>;
  retirerDuPanier: (ligneId: string) => Promise<void>;
  viderPanier: () => Promise<void>;
  ouvrirPanier: () => void;
  fermerPanier: () => void;
  effacerNotification: () => void;
}

type ContextePanier = EtatPanier & ActionsPanier;

/* ──────────────────────────────────────────────────────────────────────────── */
/* Contexte                                                                      */
/* ──────────────────────────────────────────────────────────────────────────── */

const PanierContext = createContext<ContextePanier | null>(null);

export function PanierProvider({ children }: { children: ReactNode }) {
  const [panier, setPanier] = useState<Panier | null>(null);
  const [chargement, setChargement] = useState(false);
  const [notification, setNotification] = useState<EtatPanier['notification']>(null);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [lignesEnChargement, setLignesEnChargement] = useState<Set<string>>(new Set());

  const navigate     = useNavigate();
  const utilisateur  = lireSession();
  const estConnecte  = !!utilisateur;

  /* ── Afficher une notification temporaire (3s) ────────────────────────── */
  const afficherNotification = useCallback(
    (type: 'succes' | 'erreur', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  /* ── Charger le panier depuis l'API ───────────────────────────────────── */
  const chargerPanier = useCallback(async () => {
    if (!estConnecte) return;
    try {
      setChargement(true);
      const rep = await getPanier();
      setPanier(rep.data.panier);
    } catch {
      /* Silencieux au chargement initial */
    } finally {
      setChargement(false);
    }
  }, [estConnecte]);

  /* Charger le panier au montage si l'utilisateur est connecté */
  useEffect(() => {
    if (estConnecte) {
      chargerPanier();
    } else {
      setPanier(null);
    }
  }, [estConnecte, chargerPanier]);

  /* ── Ajouter au panier ────────────────────────────────────────────────── */
  const ajouterAuPanier = useCallback(
    async (produitId: string, quantite = 1, variante = ''): Promise<boolean> => {
      if (!estConnecte) {
        /* Rediriger vers la page de connexion avec l'URL de retour */
        navigate('/connexion', {
          state: { redirectAfterLogin: window.location.pathname },
        });
        return false;
      }
      try {
        const rep = await apiAjouter(produitId, quantite, variante);
        setPanier(rep.data.panier);
        afficherNotification('succes', 'Produit ajouté au panier !');
        return true;
      } catch (err) {
        afficherNotification(
          'erreur',
          err instanceof Error ? err.message : "Impossible d'ajouter ce produit."
        );
        return false;
      }
    },
    [estConnecte, navigate, afficherNotification]
  );

  /* ── Modifier la quantité ─────────────────────────────────────────────── */
  const modifierQuantite = useCallback(
    async (ligneId: string, quantite: number) => {
      setLignesEnChargement((prev) => new Set(prev).add(ligneId));
      try {
        const rep = await apiModifier(ligneId, quantite);
        setPanier(rep.data.panier);
      } catch (err) {
        afficherNotification(
          'erreur',
          err instanceof Error ? err.message : 'Erreur lors de la mise à jour.'
        );
      } finally {
        setLignesEnChargement((prev) => {
          const suivant = new Set(prev);
          suivant.delete(ligneId);
          return suivant;
        });
      }
    },
    [afficherNotification]
  );

  /* ── Retirer du panier ────────────────────────────────────────────────── */
  const retirerDuPanier = useCallback(
    async (ligneId: string) => {
      setLignesEnChargement((prev) => new Set(prev).add(ligneId));
      try {
        const rep = await apiRetirer(ligneId);
        setPanier(rep.data.panier);
        afficherNotification('succes', 'Article retiré du panier.');
      } catch (err) {
        afficherNotification(
          'erreur',
          err instanceof Error ? err.message : 'Erreur lors de la suppression.'
        );
      } finally {
        setLignesEnChargement((prev) => {
          const suivant = new Set(prev);
          suivant.delete(ligneId);
          return suivant;
        });
      }
    },
    [afficherNotification]
  );

  /* ── Vider le panier ──────────────────────────────────────────────────── */
  const viderPanier = useCallback(async () => {
    try {
      const rep = await apiVider();
      setPanier(rep.data.panier);
      afficherNotification('succes', 'Panier vidé avec succès.');
    } catch {
      afficherNotification('erreur', 'Erreur lors de la suppression du panier.');
    }
  }, [afficherNotification]);

  const ouvrirPanier  = useCallback(() => setPanierOuvert(true), []);
  const fermerPanier  = useCallback(() => setPanierOuvert(false), []);
  const effacerNotification = useCallback(() => setNotification(null), []);

  return (
    <PanierContext.Provider
      value={{
        panier,
        chargement,
        notification,
        panierOuvert,
        lignesEnChargement,
        chargerPanier,
        ajouterAuPanier,
        modifierQuantite,
        retirerDuPanier,
        viderPanier,
        ouvrirPanier,
        fermerPanier,
        effacerNotification,
      }}
    >
      {children}
    </PanierContext.Provider>
  );
}

/** Hook pour consommer le contexte panier. */
export function usePanier(): ContextePanier {
  const ctx = useContext(PanierContext);
  if (!ctx) throw new Error('usePanier doit être utilisé dans PanierProvider');
  return ctx;
}

/** Sélecteur du nombre d'articles pour éviter les re-renders. */
export function useNombreArticlesPanier(): number {
  const { panier } = usePanier();
  return panier?.nombreArticles ?? 0;
}

// Type exporté pour usage externe
export type { LignePanier };
