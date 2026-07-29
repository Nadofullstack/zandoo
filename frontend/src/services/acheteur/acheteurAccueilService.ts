import type { ReponseAccueil } from '../../types/acheteur';

const API_URL = import.meta.env.VITE_API_URL as string;

async function verifierReponse<T>(res: Response): Promise<T> {
  const donnees = await res.json();
  if (!res.ok) throw new Error(donnees.message || 'Erreur serveur.');
  return donnees as T;
}

/**
 * Récupère les données de la page d'accueil :
 * catégories racines, nouveautés et best sellers.
 */
export async function getAccueil(): Promise<ReponseAccueil> {
  const res = await fetch(`${API_URL}/acheteur/accueil`);
  return verifierReponse(res);
}
