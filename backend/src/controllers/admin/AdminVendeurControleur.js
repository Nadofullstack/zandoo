import Vendeur from '../../models/Vendeur.js';
import User from '../../models/User.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Projection liste — exclut les champs lourds inutiles dans la liste */
const PROJECTION_LISTE = {
  notesAdmin: 0,
  'documents.autresDocuments': 0,
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/vendeurs/statistiques
   Résumé des compteurs par statut — déclaré en premier pour éviter
   que Express ne l'intercepte comme un /:id.
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesVendeurs = async (_req, res) => {
  try {
    const [enAttente, approuves, suspendus, total] = await Promise.all([
      Vendeur.countDocuments({ statut: 'en_attente' }),
      Vendeur.countDocuments({ statut: 'approuve' }),
      Vendeur.countDocuments({ statut: 'suspendu' }),
      Vendeur.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: { statistiques: { enAttente, approuves, suspendus, total } },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesVendeurs:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/vendeurs
   Liste paginée avec filtre par statut et recherche textuelle.
───────────────────────────────────────────────────────────────────────────── */
export const getVendeurs = async (req, res) => {
  try {
    const {
      statut,          // en_attente | approuve | suspendu
      recherche = '',
      page  = 1,
      limite = 15,
    } = req.query;

    const filtre = {};

    if (statut && ['en_attente', 'approuve', 'suspendu'].includes(statut)) {
      filtre.statut = statut;
    }

    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      filtre.$or = [{ nomEntreprise: regex }, { emailContact: regex }];
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [vendeurs, total] = await Promise.all([
      Vendeur.find(filtre, PROJECTION_LISTE)
        .populate('utilisateur', 'nomComplet email telephone createdAt isActive')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Vendeur.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        vendeurs,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getVendeurs:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/vendeurs/:id
   Profil complet d'un vendeur.
───────────────────────────────────────────────────────────────────────────── */
export const getVendeurParId = async (req, res) => {
  try {
    const vendeur = await Vendeur.findById(req.params.id)
      .populate('utilisateur', 'nomComplet email telephone createdAt isActive avatar googleId')
      .populate('historiqueStatut.modifiePar', 'nomComplet email')
      .lean();

    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Vendeur introuvable.' });
    }

    return res.status(200).json({ success: true, data: { vendeur } });
  } catch (erreur) {
    console.error('Erreur getVendeurParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/vendeurs/:id/statut
   Change le statut du vendeur : approuve | suspendu | en_attente
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutVendeur = async (req, res) => {
  try {
    const { statut, raison = '' } = req.body;

    if (!['en_attente', 'approuve', 'suspendu'].includes(statut)) {
      return res.status(422).json({
        success: false,
        message: 'Statut invalide. Valeurs acceptées : en_attente, approuve, suspendu.',
      });
    }

    const vendeur = await Vendeur.findById(req.params.id);
    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Vendeur introuvable.' });
    }

    vendeur.statut = statut;
    vendeur.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     raison.trim().slice(0, 300),
      modifieAt:  new Date(),
    });

    await vendeur.save();

    /* Synchronise isActive sur l'utilisateur lié */
    await User.findByIdAndUpdate(vendeur.utilisateur, {
      isActive: statut !== 'suspendu',
    });

    const miseAJour = await Vendeur.findById(vendeur._id)
      .populate('utilisateur', 'nomComplet email telephone isActive')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}.`,
      data: { vendeur: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutVendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/vendeurs/:id/notes
   Mise à jour des notes internes de l'administrateur.
───────────────────────────────────────────────────────────────────────────── */
export const modifierNotesAdmin = async (req, res) => {
  try {
    const { notesAdmin = '' } = req.body;

    const vendeur = await Vendeur.findByIdAndUpdate(
      req.params.id,
      { notesAdmin: notesAdmin.trim().slice(0, 500) },
      { new: true, runValidators: true }
    ).populate('utilisateur', 'nomComplet email').lean();

    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Vendeur introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notes mises à jour.',
      data: { vendeur },
    });
  } catch (erreur) {
    console.error('Erreur modifierNotesAdmin:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
