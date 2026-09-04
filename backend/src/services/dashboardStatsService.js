import User from '../models/User.js';
import Commande from '../models/Commande.js';

/**
 * Service pour les statistiques temporelles du dashboard admin
 * Fournit des données agrégées par jour, semaine, mois et année
 */

/**
 * Retourne les dates de début et fin selon la période
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Object} { dateDebut, dateFin }
 */
export const getPeriodeDates = (periode) => {
  const maintenant = new Date();
  const dateFin = new Date(maintenant);
  let dateDebut;

  switch (periode) {
    case 'jour':
      dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
      break;
    case 'semaine': {
      const jour = maintenant.getDay();
      const diff = maintenant.getDate() - jour + (jour === 0 ? -6 : 1);
      dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), diff);
      break;
    }
    case 'mois':
      dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      break;
    case 'annee':
      dateDebut = new Date(maintenant.getFullYear(), 0, 1);
      break;
    default:
      dateDebut = new Date(maintenant.setDate(maintenant.getDate() - 30)); // 30 derniers jours par défaut
  }

  return { dateDebut, dateFin };
};

/**
 * Crée les groupes pour l'agrégation MongoDB selon la période
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Object} Groupes pour createdAt
 */
export const getGroupingStage = (periode) => {
  const grouping = {
    $group: {
      _id: null,
      acheteurs: {
        $sum: {
          $cond: [{ $eq: ['$role', 'acheteur'] }, 1, 0],
        },
      },
      vendeurs: {
        $sum: {
          $cond: [{ $eq: ['$role', 'vendeur'] }, 1, 0],
        },
      },
      livreurs: {
        $sum: {
          $cond: [{ $eq: ['$role', 'livreur'] }, 1, 0],
        },
      },
      admins: {
        $sum: {
          $cond: [{ $eq: ['$role', 'admin'] }, 1, 0],
        },
      },
      total: { $sum: 1 },
    },
  };

  if (periode === 'jour') {
    grouping.$group._id = {
      $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' },
    };
  } else if (periode === 'semaine') {
    grouping.$group._id = {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
    };
  } else if (periode === 'mois') {
    grouping.$group._id = {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
    };
  } else if (periode === 'annee') {
    grouping.$group._id = {
      $dateToString: { format: '%Y-%m', date: '$createdAt' },
    };
  }

  return grouping;
};

/**
 * Récupère les statistiques temporelles des utilisateurs
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise<Array>} Données agrégées
 */
export const getStatistiquesTemporelles = async (periode = 'mois') => {
  try {
    const { dateDebut, dateFin } = getPeriodeDates(periode);
    const grouping = getGroupingStage(periode);

    const stats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateDebut,
            $lte: dateFin,
          },
        },
      },
      grouping,
      {
        $sort: { '_id': 1 },
      },
    ]);

    return stats || [];
  } catch (erreur) {
    console.error('Erreur getStatistiquesTemporelles:', erreur);
    throw new Error('Erreur lors de la récupération des statistiques temporelles');
  }
};

/**
 * Récupère l'évolution des utilisateurs sur une courbe temporelle
 * Utile pour les graphiques linéaires
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise<Array>} Données de l'évolution temporelle
 */
export const getEvolutionUtilisateurs = async (periode = 'mois') => {
  try {
    const { dateDebut, dateFin } = getPeriodeDates(periode);

    let formatDate;
    if (periode === 'jour') {
      formatDate = '%Y-%m-%d %H:00';
    } else if (periode === 'semaine' || periode === 'mois') {
      formatDate = '%Y-%m-%d';
    } else if (periode === 'annee') {
      formatDate = '%Y-%m';
    }

    const evolution = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateDebut,
            $lte: dateFin,
          },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: formatDate, date: '$createdAt' },
            },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
      {
        $group: {
          _id: '$_id.date',
          roles: {
            $push: {
              role: '$_id.role',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
      {
        $sort: { '_id': 1 },
      },
    ]);

    return evolution || [];
  } catch (erreur) {
    console.error('Erreur getEvolutionUtilisateurs:', erreur);
    throw new Error('Erreur lors de la récupération de l\'évolution des utilisateurs');
  }
};

/**
 * Récupère les statistiques globales par rôle pour une période donnée
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise<Array>} Données par rôle
 */
export const getStatistiquesByRole = async (periode = 'mois') => {
  try {
    const { dateDebut, dateFin } = getPeriodeDates(periode);

    const stats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateDebut,
            $lte: dateFin,
          },
        },
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { 'count': -1 },
      },
    ]);

    return stats || [];
  } catch (erreur) {
    console.error('Erreur getStatistiquesByRole:', erreur);
    throw new Error('Erreur lors de la récupération des statistiques par rôle');
  }
};

/**
 * Récupère les statistiques de comparaison entre deux périodes
 * @param {string} periode - 'jour', 'semaine', 'mois', 'annee'
 * @returns {Promise<Object>} Comparaison entre la période actuelle et la précédente
 */
export const getComparaisonPeriodes = async (periode = 'mois') => {
  try {
    const { dateDebut: debutActuel, dateFin: finActuel } = getPeriodeDates(periode);

    // Calcul de la période précédente
    let duree;
    if (periode === 'jour') {
      duree = 1;
    } else if (periode === 'semaine') {
      duree = 7;
    } else if (periode === 'mois') {
      duree = 30;
    } else if (periode === 'annee') {
      duree = 365;
    }

    const debutPrecedent = new Date(debutActuel);
    debutPrecedent.setDate(debutPrecedent.getDate() - duree);
    const finPrecedent = new Date(debutActuel);
    finPrecedent.setSeconds(finPrecedent.getSeconds() - 1);

    const [statsActuelle, statsPrecedente] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: debutActuel,
              $lte: finActuel,
            },
          },
        },
        {
          $group: {
            _id: null,
            acheteurs: {
              $sum: {
                $cond: [{ $eq: ['$role', 'acheteur'] }, 1, 0],
              },
            },
            vendeurs: {
              $sum: {
                $cond: [{ $eq: ['$role', 'vendeur'] }, 1, 0],
              },
            },
            livreurs: {
              $sum: {
                $cond: [{ $eq: ['$role', 'livreur'] }, 1, 0],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: debutPrecedent,
              $lte: finPrecedent,
            },
          },
        },
        {
          $group: {
            _id: null,
            acheteurs: {
              $sum: {
                $cond: [{ $eq: ['$role', 'acheteur'] }, 1, 0],
              },
            },
            vendeurs: {
              $sum: {
                $cond: [{ $eq: ['$role', 'vendeur'] }, 1, 0],
              },
            },
            livreurs: {
              $sum: {
                $cond: [{ $eq: ['$role', 'livreur'] }, 1, 0],
              },
            },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const actuelle = statsActuelle[0] || { acheteurs: 0, vendeurs: 0, livreurs: 0, total: 0 };
    const precedente = statsPrecedente[0] || { acheteurs: 0, vendeurs: 0, livreurs: 0, total: 0 };

    const calculVariation = (nouveau, ancien) => {
      if (ancien === 0) return nouveau > 0 ? 100 : 0;
      return ((nouveau - ancien) / ancien) * 100;
    };

    return {
      actuelle,
      precedente,
      variations: {
        acheteurs: calculVariation(actuelle.acheteurs, precedente.acheteurs),
        vendeurs: calculVariation(actuelle.vendeurs, precedente.vendeurs),
        livreurs: calculVariation(actuelle.livreurs, precedente.livreurs),
        total: calculVariation(actuelle.total, precedente.total),
      },
    };
  } catch (erreur) {
    console.error('Erreur getComparaisonPeriodes:', erreur);
    throw new Error('Erreur lors de la récupération de la comparaison des périodes');
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STATISTIQUES DE VENTES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Retourne les dates de la période précédente (même durée, juste avant)
 * @param {string} periode
 */
const getPrecedentePeriode = (periode) => {
  const { dateDebut: debutActuel } = getPeriodeDates(periode);
  let dureeJours;
  if (periode === 'jour')    dureeJours = 1;
  else if (periode === 'semaine') dureeJours = 7;
  else if (periode === 'mois')   dureeJours = 30;
  else                            dureeJours = 365;

  const debutPrecedent = new Date(debutActuel);
  debutPrecedent.setDate(debutPrecedent.getDate() - dureeJours);
  const finPrecedent = new Date(debutActuel);
  finPrecedent.setSeconds(finPrecedent.getSeconds() - 1);
  return { debutPrecedent, finPrecedent };
};

/**
 * Récupère l'évolution temporelle des ventes (montant + nombre de commandes)
 * Seules les commandes payées/livrées/expédiées/en_préparation sont comptabilisées
 * @param {string} periode - 'jour' | 'semaine' | 'mois' | 'annee'
 * @returns {Promise<Array>}
 */
export const getEvolutionVentes = async (periode = 'mois') => {
  try {
    const { dateDebut, dateFin } = getPeriodeDates(periode);

    let formatDate;
    if (periode === 'jour')                         formatDate = '%H:00';
    else if (periode === 'semaine' || periode === 'mois') formatDate = '%d/%m';
    else                                            formatDate = '%m/%Y';

    const evolution = await Commande.aggregate([
      {
        $match: {
          createdAt: { $gte: dateDebut, $lte: dateFin },
          statut: { $in: ['payee', 'en_preparation', 'expediee', 'livree'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: formatDate, date: '$createdAt' } },
          chiffreAffaires: { $sum: '$total' },
          nombreCommandes: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return evolution || [];
  } catch (erreur) {
    console.error('Erreur getEvolutionVentes:', erreur);
    throw new Error('Erreur lors de la récupération de l\'évolution des ventes');
  }
};

/**
 * Récupère les KPIs de ventes comparant la période actuelle à la précédente
 * @param {string} periode - 'jour' | 'semaine' | 'mois' | 'annee'
 * @returns {Promise<Object>}
 */
export const getComparaisonVentes = async (periode = 'mois') => {
  try {
    const { dateDebut: debutActuel, dateFin: finActuel } = getPeriodeDates(periode);
    const { debutPrecedent, finPrecedent } = getPrecedentePeriode(periode);

    const STATUTS_VENTE = ['payee', 'en_preparation', 'expediee', 'livree'];

    const aggrVentes = (debut, fin) =>
      Commande.aggregate([
        {
          $match: {
            createdAt: { $gte: debut, $lte: fin },
            statut: { $in: STATUTS_VENTE },
          },
        },
        {
          $group: {
            _id: null,
            chiffreAffaires: { $sum: '$total' },
            nombreCommandes: { $sum: 1 },
            panierMoyen:     { $avg: '$total' },
          },
        },
      ]);

    const [statsActuelle, statsPrecedente, commandesEnAttente] = await Promise.all([
      aggrVentes(debutActuel, finActuel),
      aggrVentes(debutPrecedent, finPrecedent),
      Commande.countDocuments({ statut: 'en_attente' }),
    ]);

    const actuelle = statsActuelle[0] || { chiffreAffaires: 0, nombreCommandes: 0, panierMoyen: 0 };
    const precedente = statsPrecedente[0] || { chiffreAffaires: 0, nombreCommandes: 0, panierMoyen: 0 };

    const variation = (nv, anc) => {
      if (anc === 0) return nv > 0 ? 100 : 0;
      return ((nv - anc) / anc) * 100;
    };

    return {
      actuelle: {
        chiffreAffaires: Math.round(actuelle.chiffreAffaires),
        nombreCommandes: actuelle.nombreCommandes,
        panierMoyen:     Math.round(actuelle.panierMoyen || 0),
        commandesEnAttente,
      },
      precedente: {
        chiffreAffaires: Math.round(precedente.chiffreAffaires),
        nombreCommandes: precedente.nombreCommandes,
        panierMoyen:     Math.round(precedente.panierMoyen || 0),
      },
      variations: {
        chiffreAffaires: variation(actuelle.chiffreAffaires, precedente.chiffreAffaires),
        nombreCommandes: variation(actuelle.nombreCommandes, precedente.nombreCommandes),
        panierMoyen:     variation(actuelle.panierMoyen || 0, precedente.panierMoyen || 0),
      },
    };
  } catch (erreur) {
    console.error('Erreur getComparaisonVentes:', erreur);
    throw new Error('Erreur lors de la récupération des KPIs de ventes');
  }
};

/**
 * Récupère la répartition des ventes par statut de commande
 * @param {string} periode
 * @returns {Promise<Array>}
 */
export const getVentesParStatut = async (periode = 'mois') => {
  try {
    const { dateDebut, dateFin } = getPeriodeDates(periode);

    const stats = await Commande.aggregate([
      { $match: { createdAt: { $gte: dateDebut, $lte: dateFin } } },
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 },
          montant: { $sum: '$total' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return stats || [];
  } catch (erreur) {
    console.error('Erreur getVentesParStatut:', erreur);
    throw new Error('Erreur lors de la récupération des ventes par statut');
  }
};
