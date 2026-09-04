import axios from 'axios';
import { supprimerSession } from './auth/authService';
import { NavigationService } from './navigationService';

/**
 * Instance axios partagée par tous les services.
 * - baseURL : VITE_API_URL depuis .env
 * - withCredentials : envoie automatiquement le cookie httpOnly
 * - Les erreurs HTTP sont propagées via axios (status >= 400 → exception)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/* Intercepteur de réponse
 * - 401 : token expiré ou invalide → déconnexion immédiate + redirect /connexion
 * - autres erreurs : normalise le message
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Supprime la session locale (le cookie httpOnly sera vidé par le serveur
      // lors du prochain appel à /auth/logout, ou expiration naturelle).
      supprimerSession();
      // Redirige vers la page de connexion sans laisser l'utilisateur sur la
      // page protégée. On utilise replace pour ne pas polluer l'historique.
      NavigationService.navigate('/connexion', { replace: true });
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Erreur serveur.';
    return Promise.reject(new Error(message));
  }
);

export default api;
