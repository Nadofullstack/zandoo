import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { lireSession } from '../../services/auth/authService';

/**
 * Protège les pages réservées aux utilisateurs connectés (espace acheteur).
 * Redirige vers /connexion en mémorisant la page demandée pour y revenir ensuite.
 */
export default function GardeConnexion({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!lireSession()) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
}
