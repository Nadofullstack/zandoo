import axios from 'axios';

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

/* Intercepteur de réponse — normalise le message d'erreur */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Erreur serveur.';
    return Promise.reject(new Error(message));
  }
);

export default api;
