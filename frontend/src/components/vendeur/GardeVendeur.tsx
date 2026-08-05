import { Navigate } from 'react-router-dom';
import { lireSession } from '../../services/auth/authService';

/**
 * Garde de route pour les pages de l'espace vendeur.
 * Vérifie que l'utilisateur connecté a le rôle "vendeur" OU estVendeur = true
 * (cas d'un acheteur qui possède aussi une boutique approuvée).
 * Si non → redirige vers /connexion.
 */
export default function GardeVendeur({ children }: { children: React.ReactNode }) {
  const session = lireSession();

  const aAccesVendeur = session && (session.role === 'vendeur' || session.estVendeur === true);

  if (!aAccesVendeur) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
