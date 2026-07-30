import api from '../api';
import type { ReponseAccueil } from '../../types/acheteur';

/**
 * Récupère les données de la page d'accueil :
 * catégories racines, nouveautés et best sellers.
 */
export async function getAccueil(): Promise<ReponseAccueil> {
  const { data } = await api.get('/acheteur/accueil');
  return data;
}
