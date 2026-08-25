import User from '../../models/User.js';
import {
  getEvolutionUtilisateurs,
  getStatistiquesByRole,
  getComparaisonPeriodes,
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

