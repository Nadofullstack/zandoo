import { Navigate } from 'react-router-dom';
import { lireSession } from '../../../services/auth/authService';

/**
 * Garde de route admin.
 * Vérifie que l'utilisateur connecté a le rôle "admin"
 * en lisant la session sauvegardée dans localStorage lors du login.
 *
 * Si la session n'existe pas ou si le rôle n'est pas admin
 * → redirige vers /connexion.
 */
export default function GardeRouteAdmin({ children }: { children: React.ReactNode }) {
  const session = lireSession();

  if (!session || session.role !== 'admin') {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
