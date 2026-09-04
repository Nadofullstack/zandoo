import User from '../../models/User.js';
import {
  getEvolutionUtilisateurs,
  getStatistiquesByRole,
  getComparaisonPeriodes,
  getEvolutionVentes,
  getComparaisonVentes,
  getVentesParStatut,
} from '../../services/dashboardStatsService.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

const ROLES_VALIDES  = ['acheteur', 'vendeur', 'livreur', 'admin'];
const CHAMPS_EDITION = ['fullName', 'email', 'phone', 'role', 'isVerified'];

/** Projection sécurisée — jamais de mot de passe en réponse */
const PROJECTION_SECURISEE = { password: 0 };

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/utilisateurs/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesUtilisateurs = async (_req, res) => {
  try {
    const [total, acheteurs, vendeurs, livreurs, admins, actifs, suspendus] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'acheteur' }),
        User.countDocuments({ role: 'vendeur' }),
        User.countDocuments({ role: 'livreur' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
      ]);

    return res.status(200).json({
      success: true,
      data: { statistiques: { total, acheteurs, vendeurs, livreurs, admins, actifs, suspendus } },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesUtilisateurs:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/utilisateurs
───────────────────────────────────────────────────────────────────────────── */
export const getUtilisateurs = async (req, res) => {
  try {
    const {
      role,
      actif,
      recherche = '',
      dateDebut,
      dateFin,
      page  = 1,
      limite = 20,
    } = req.query;

    const filtre = {};

    if (role && ROLES_VALIDES.includes(role)) filtre.role = role;
    if (actif === 'true')  filtre.isActive = true;
    if (actif === 'false') filtre.isActive = false;

    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      filtre.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }

    if (dateDebut || dateFin) {
      filtre.createdAt = {};
      if (dateDebut) filtre.createdAt.$gte = new Date(dateDebut);
      if (dateFin)   filtre.createdAt.$lte = new Date(dateFin);
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [utilisateurs, total] = await Promise.all([
      User.find(filtre, PROJECTION_SECURISEE)
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      User.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        utilisateurs,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getUtilisateurs:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/utilisateurs/:id
───────────────────────────────────────────────────────────────────────────── */
export const getUtilisateurParId = async (req, res) => {
  try {
    const utilisateur = await User.findById(req.params.id, PROJECTION_SECURISEE).lean();

    if (!utilisateur) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    return res.status(200).json({ success: true, data: { utilisateur } });
  } catch (erreur) {
    console.error('Erreur getUtilisateurParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/admin/utilisateurs/:id
───────────────────────────────────────────────────────────────────────────── */
export const modifierUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user._id) === id && req.body.role && req.body.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle.',
      });
    }

    const miseAJour = {};
    for (const champ of CHAMPS_EDITION) {
      if (req.body[champ] !== undefined) miseAJour[champ] = req.body[champ];
    }

    if (miseAJour.role && !ROLES_VALIDES.includes(miseAJour.role)) {
      return res.status(422).json({
        success: false,
        message: `Rôle invalide. Valeurs : ${ROLES_VALIDES.join(', ')}.`,
      });
    }

    if (miseAJour.email) {
      miseAJour.email = miseAJour.email.toLowerCase().trim();
      const existant = await User.findOne({ email: miseAJour.email, _id: { $ne: id } }).lean();
      if (existant) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse e-mail est déjà utilisée par un autre compte.',
        });
      }
    }

    const utilisateur = await User.findByIdAndUpdate(
      id,
      { $set: miseAJour },
      { new: true, runValidators: true, projection: PROJECTION_SECURISEE }
    ).lean();

    if (!utilisateur) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour.',
      data: { utilisateur },
    });
  } catch (erreur) {
    console.error('Erreur modifierUtilisateur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/utilisateurs/:id/statut
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(422).json({
        success: false,
        message: 'Le champ isActive doit être un booléen.',
      });
    }

    if (String(req.user._id) === id && !isActive) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas suspendre votre propre compte.',
      });
    }

    const utilisateur = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, projection: PROJECTION_SECURISEE }
    ).lean();

    if (!utilisateur) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: `Compte ${isActive ? 'réactivé' : 'suspendu'}.`,
      data: { utilisateur },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutUtilisateur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/utilisateurs/:id
───────────────────────────────────────────────────────────────────────────── */
export const supprimerUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user._id) === id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte.',
      });
    }

    const utilisateur = await User.findByIdAndDelete(id).lean();

    if (!utilisateur) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Compte supprimé définitivement.',
    });
  } catch (erreur) {
    console.error('Erreur supprimerUtilisateur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/dashboard/graphiques-temporels?periode=mois
   Récupère l'évolution temporelle des utilisateurs pour les graphiques
───────────────────────────────────────────────────────────────────────────── */
export const getGraphiquesTemporelles = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    const perioden = ['jour', 'semaine', 'mois', 'annee'];

    if (!perioden.includes(periode)) {
      return res.status(422).json({
        success: false,
        message: `Période invalide. Valeurs acceptées : ${perioden.join(', ')}.`,
      });
    }

    const donnees = await getEvolutionUtilisateurs(periode);

    /* Formater les données pour Chart.js */
    const labels = donnees.map((d) => d._id);
    const datasets = [
      {
        label: 'Acheteurs',
        data: donnees.map((d) => {
          const role = d.roles.find((r) => r.role === 'acheteur');
          return role ? role.count : 0;
        }),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Vendeurs',
        data: donnees.map((d) => {
          const role = d.roles.find((r) => r.role === 'vendeur');
          return role ? role.count : 0;
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Livreurs',
        data: donnees.map((d) => {
          const role = d.roles.find((r) => r.role === 'livreur');
          return role ? role.count : 0;
        }),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ];

    return res.status(200).json({
      success: true,
      periode,
      data: { labels, datasets },
    });
  } catch (erreur) {
    console.error('Erreur getGraphiquesTemporelles:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/dashboard/stats-par-role?periode=mois
   Récupère les statistiques par rôle pour un graphique en camembert
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesParRoleCtrl = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    const perioden = ['jour', 'semaine', 'mois', 'annee'];

    if (!perioden.includes(periode)) {
      return res.status(422).json({
        success: false,
        message: `Période invalide. Valeurs acceptées : ${perioden.join(', ')}.`,
      });
    }

    const stats = await getStatistiquesByRole(periode);

    /* Formater les données pour un graphique en camembert */
    const labels = stats.map((s) => {
      const roleMap = {
        acheteur: 'Acheteurs',
        vendeur: 'Vendeurs',
        livreur: 'Livreurs',
        admin: 'Administrateurs',
      };
      return roleMap[s._id] || s._id;
    });

    const data = stats.map((s) => s.count);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return res.status(200).json({
      success: true,
      periode,
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, stats.length),
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesParRoleCtrl:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/dashboard/comparaison?periode=mois
   Récupère la comparaison entre la période actuelle et la précédente
───────────────────────────────────────────────────────────────────────────── */
export const getComparaisonPeriodeCtrl = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    const perioden = ['jour', 'semaine', 'mois', 'annee'];

    if (!perioden.includes(periode)) {
      return res.status(422).json({
        success: false,
        message: `Période invalide. Valeurs acceptées : ${perioden.join(', ')}.`,
      });
    }

    const comparaison = await getComparaisonPeriodes(periode);

    return res.status(200).json({
      success: true,
      periode,
      data: comparaison,
    });
  } catch (erreur) {
    console.error('Erreur getComparaisonPeriodeCtrl:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONTRÔLEURS VENTES
   ═══════════════════════════════════════════════════════════════════════════ */

const PERIODES_VALIDES = ['jour', 'semaine', 'mois', 'annee'];

/** Validation commune de la période — retourne false et répond si invalide */
const validerPeriode = (periode, res) => {
  if (!PERIODES_VALIDES.includes(periode)) {
    res.status(422).json({
      success: false,
      message: `Période invalide. Valeurs acceptées : ${PERIODES_VALIDES.join(', ')}.`,
    });
    return false;
  }
  return true;
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/dashboard/evolution-ventes?periode=mois
   Évolution temporelle du CA et du nombre de commandes (double axe)
───────────────────────────────────────────────────────────────────────────── */
export const getEvolutionVentesCtrl = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    if (!validerPeriode(periode, res)) return;

    const evolution = await getEvolutionVentes(periode);

    const labels          = evolution.map((d) => d._id);
    const chiffreAffaires = evolution.map((d) => d.chiffreAffaires);
    const nombreCommandes = evolution.map((d) => d.nombreCommandes);

    return res.status(200).json({
      success: true,
      periode,
      data: {
        labels,
        datasets: [
          {
            label: "Chiffre d'affaires (FCFA)",
            data: chiffreAffaires,
            type: 'bar',
            backgroundColor: 'rgba(99, 102, 241, 0.75)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 6,
            yAxisID: 'yCA',
          },
          {
            label: 'Commandes',
            data: nombreCommandes,
            type: 'line',
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderWidth: 2.5,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f59e0b',
            fill: true,
            yAxisID: 'yCommandes',
          },
        ],
      },
    });
  } catch (erreur) {
    console.error('Erreur getEvolutionVentesCtrl:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/dashboard/kpis-ventes?periode=mois
   KPIs ventes : CA, nb commandes, panier moyen + variations vs période précédente
───────────────────────────────────────────────────────────────────────────── */
export const getKpisVentesCtrl = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    if (!validerPeriode(periode, res)) return;

    const kpis = await getComparaisonVentes(periode);

    return res.status(200).json({
      success: true,
      periode,
      data: kpis,
    });
  } catch (erreur) {
    console.error('Erreur getKpisVentesCtrl:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/dashboard/statuts-commandes?periode=mois
   Répartition des commandes par statut sur la période (pour donut)
───────────────────────────────────────────────────────────────────────────── */
export const getStatutsCommandesCtrl = async (req, res) => {
  try {
    const { periode = 'mois' } = req.query;
    if (!validerPeriode(periode, res)) return;

    const stats = await getVentesParStatut(periode);

    const LABELS_STATUT = {
      en_attente:     'En attente',
      payee:          'Payée',
      en_preparation: 'En préparation',
      expediee:       'Expédiée',
      livree:         'Livrée',
      annulee:        'Annulée',
    };

    const COULEURS_STATUT = {
      en_attente:     { bg: 'rgba(245, 158, 11, 0.8)',  border: '#f59e0b' },
      payee:          { bg: 'rgba(99, 102, 241, 0.8)',  border: '#6366f1' },
      en_preparation: { bg: 'rgba(59, 130, 246, 0.8)',  border: '#3b82f6' },
      expediee:       { bg: 'rgba(139, 92, 246, 0.8)',  border: '#8b5cf6' },
      livree:         { bg: 'rgba(16, 185, 129, 0.8)',  border: '#10b981' },
      annulee:        { bg: 'rgba(239, 68, 68, 0.8)',   border: '#ef4444' },
    };

    const labels   = stats.map((s) => LABELS_STATUT[s._id] ?? s._id);
    const data     = stats.map((s) => s.count);
    const montants = stats.map((s) => Math.round(s.montant));
    const bgs      = stats.map((s) => (COULEURS_STATUT[s._id] ?? { bg: 'rgba(148,163,184,0.8)' }).bg);
    const borders  = stats.map((s) => (COULEURS_STATUT[s._id] ?? { border: '#94a3b8' }).border);

    return res.status(200).json({
      success: true,
      periode,
      data: {
        labels,
        montants,
        datasets: [{ data, backgroundColor: bgs, borderColor: borders, borderWidth: 2 }],
      },
    });
  } catch (erreur) {
    console.error('Erreur getStatutsCommandesCtrl:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

