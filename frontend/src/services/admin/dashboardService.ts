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
 * Récupère la comparaison entre deux périodes (utilisateurs)
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
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

/* ═══════════════════════════════════════════════════════════════════════════
   VENTES
   ═══════════════════════════════════════════════════════════════════════════ */

export type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

export interface ChartDataset {
  label?: string;
  data: number[];
  type?: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderRadius?: number;
  tension?: number;
  pointRadius?: number;
  pointBackgroundColor?: string;
  fill?: boolean;
  yAxisID?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  montants?: number[]; // uniquement pour statuts-commandes
}

export interface KpisVentesActuelle {
  chiffreAffaires: number;
  nombreCommandes: number;
  panierMoyen: number;
  commandesEnAttente: number;
}

export interface KpisVentes {
  actuelle: KpisVentesActuelle;
  precedente: { chiffreAffaires: number; nombreCommandes: number; panierMoyen: number };
  variations: { chiffreAffaires: number; nombreCommandes: number; panierMoyen: number };
}

/**
 * Évolution temporelle du CA et du nombre de commandes (double axe)
 * @param periode - 'jour' | 'semaine' | 'mois' | 'annee'
 * @returns ChartData prêt pour Chart.js (bar + line)
 */
export const getDashboardEvolutionVentes = async (periode: Periode = 'mois'): Promise<ChartData> => {
  try {
    const { data } = await api.get('/admin/dashboard/evolution-ventes', { params: { periode } });
    if (!data.success) throw new Error(data.message || 'Erreur évolution ventes');
    return data.data as ChartData;
  } catch (error) {
    console.error('Erreur getDashboardEvolutionVentes:', error);
    throw error;
  }
};

/**
 * KPIs ventes : CA, nb commandes, panier moyen + variations vs période précédente
 * @param periode - 'jour' | 'semaine' | 'mois' | 'annee'
 * @returns KpisVentes
 */
export const getDashboardKpisVentes = async (periode: Periode = 'mois'): Promise<KpisVentes> => {
  try {
    const { data } = await api.get('/admin/dashboard/kpis-ventes', { params: { periode } });
    if (!data.success) throw new Error(data.message || 'Erreur KPIs ventes');
    return data.data as KpisVentes;
  } catch (error) {
    console.error('Erreur getDashboardKpisVentes:', error);
    throw error;
  }
};

/**
 * Répartition des commandes par statut — donut chart
 * @param periode - 'jour' | 'semaine' | 'mois' | 'annee'
 * @returns ChartData avec champ montants[]
 */
export const getDashboardStatutsCommandes = async (periode: Periode = 'mois'): Promise<ChartData> => {
  try {
    const { data } = await api.get('/admin/dashboard/statuts-commandes', { params: { periode } });
    if (!data.success) throw new Error(data.message || 'Erreur statuts commandes');
    return data.data as ChartData;
  } catch (error) {
    console.error('Erreur getDashboardStatutsCommandes:', error);
    throw error;
  }
};
