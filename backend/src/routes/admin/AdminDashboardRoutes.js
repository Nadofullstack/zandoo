import { Router } from 'express';
import {
  getGraphiquesTemporelles,
  getStatistiquesParRoleCtrl,
  getComparaisonPeriodeCtrl,
} from '../../controllers/admin/AdminUtilisateurControleur.js';
import { protect, requireRole } from '../../middlewars/authentification.js';

const routeur = Router();

/**
 * ROUTES DE DASHBOARD - STATISTIQUES ET GRAPHIQUES
 * 
 * Toutes les routes nécessitent:
 * - Authentification (token JWT valide)
 * - Rôle admin
 * 
 * Sécurité:
 * - Les données sont validées et filtrées
 * - Les périodes acceptées: jour, semaine, mois, année
 * - Les mots de passe ne sont jamais renvoyés
 */

/* Middleware de sécurité pour toutes les routes */
routeur.use(protect, requireRole('admin'));

/**
 * GET /api/admin/dashboard/graphiques-temporels
 * Récupère l'évolution temporelle des utilisateurs par rôle
 * Query params:
 *   - periode: 'jour' | 'semaine' | 'mois' | 'annee' (défaut: 'mois')
 * Response: { success, periode, data: { labels, datasets } }
 */
routeur.get('/graphiques-temporels', getGraphiquesTemporelles);

/**
 * GET /api/admin/dashboard/stats-par-role
 * Récupère les statistiques par rôle (pour graphique en camembert)
 * Query params:
 *   - periode: 'jour' | 'semaine' | 'mois' | 'annee' (défaut: 'mois')
 * Response: { success, periode, data: { labels, datasets } }
 */
routeur.get('/stats-par-role', getStatistiquesParRoleCtrl);

/**
 * GET /api/admin/dashboard/comparaison
 * Récupère la comparaison entre la période actuelle et la précédente
 * Query params:
 *   - periode: 'jour' | 'semaine' | 'mois' | 'annee' (défaut: 'mois')
 * Response: {
 *   success,
 *   periode,
 *   data: {
 *     actuelle: { acheteurs, vendeurs, livreurs, total },
 *     precedente: { acheteurs, vendeurs, livreurs, total },
 *     variations: { acheteurs: %, vendeurs: %, livreurs: %, total: % }
 *   }
 * }
 */
routeur.get('/comparaison', getComparaisonPeriodeCtrl);

export default routeur;
