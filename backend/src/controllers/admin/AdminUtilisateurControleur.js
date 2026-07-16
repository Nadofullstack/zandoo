import User from '../../models/User.js';

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
