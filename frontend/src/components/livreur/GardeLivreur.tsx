import { Navigate } from 'react-router-dom';
import { lireSession } from '../../services/auth/authService';

/**
 * Garde de route pour les pages livreur authentifiées.
 * Vérifie que l'utilisateur connecté a le rôle "livreur".
 * Si non → redirige vers /connexion.
 */
export default function GardeLivreur({ children }: { children: React.ReactNode }) {
  const session = lireSession();

  if (!session || session.role !== 'livreur') {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
