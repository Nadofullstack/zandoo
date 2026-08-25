import api from '../api';

/**
 * Service API pour le Dashboard Admin
 * Communique avec les endpoints de statistiques et graphiques
 * 
 * Sécurité:
 * - Les requêtes incluent le token JWT automatiquement via cookies HttpOnly
 * - Utilise l'instance axios centralisée avec authentification
 * - Toutes les erreurs sont loggées pour la détection de problèmes
 */

/**
 * Récupère les données temporelles pour le graphique en courbe
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise<Object>} { labels, datasets }
 */
export const getDashboardGraphiquesTemporelles = async (periode = 'mois') => {
  try {
    const { data } = await api.get('/admin/dashboard/graphiques-temporels', {
      params: { periode },
    });

    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la récupération des graphiques');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur getDashboardGraphiquesTemporelles:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques par rôle pour un graphique en camembert
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise<Object>} { labels, datasets }
 */
export const getDashboardStatistiquesByRole = async (periode = 'mois') => {
  try {
    const { data } = await api.get('/admin/dashboard/stats-par-role', {
      params: { periode },
    });

    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur getDashboardStatistiquesByRole:', error);
    throw error;
  }
};

/**
 * Récupère la comparaison entre deux périodes
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annea'
 * @returns {Promise<Object>} { actuelle, precedente, variations }
 */
export const getDashboardComparaison = async (periode = 'mois') => {
  try {
    const { data } = await api.get('/admin/dashboard/comparaison', {
      params: { periode },
    });

    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de la récupération de la comparaison');
    }

    return data.data;
  } catch (error) {
    console.error('Erreur getDashboardComparaison:', error);
    throw error;
  }
};
