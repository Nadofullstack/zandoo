import Commande from '../../models/Commande.js';
import { validationResult } from 'express-validator';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Projection liste — exclut les champs lourds inutiles */
const PROJECTION_LISTE = {
  notesAdmin: 0,
  'historiqueStatut': 0,
  'adresseFacturation': 0,
};

/** Retourne les erreurs de validation ou null */
function getErreurs(req) {
  const erreurs = validationResult(req);
  return erreurs.isEmpty() ? null : erreurs.array();
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/commandes/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesCommandes = async (_req, res) => {
  try {
    const [enAttente, payees, expediees, livrees, annulees, total] = await Promise.all([
      Commande.countDocuments({ statut: 'en_attente' }),
      Commande.countDocuments({ statut: 'payee' }),
      Commande.countDocuments({ statut: 'expediee' }),
      Commande.countDocuments({ statut: 'livree' }),
      Commande.countDocuments({ statut: 'annulee' }),
      Commande.countDocuments(),
    ]);

    /* Chiffre d'affaires total (commandes livrées ou payées) */
    const aggregation = await Commande.aggregate([
      { $match: { statut: { $in: ['payee', 'expediee', 'livree'] } } },
      { $group: { _id: null, chiffreAffaires: { $sum: '$total' } } },
    ]);
    const chiffreAffaires = aggregation[0]?.chiffreAffaires ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        statistiques: { enAttente, payees, expediees, livrees, annulees, total, chiffreAffaires },
      },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/commandes
   Liste paginée avec filtres.
───────────────────────────────────────────────────────────────────────────── */
export const getCommandes = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const {
      statut,
      recherche = '',
      dateDebut,
      dateFin,
      page   = 1,
      limite = 15,
    } = req.query;

    const filtre = {};

    if (statut) filtre.statut = statut;

    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      filtre.$or = [{ numero: regex }];
    }

    if (dateDebut || dateFin) {
      filtre.createdAt = {};
      if (dateDebut) filtre.createdAt.$gte = new Date(dateDebut);
      if (dateFin)   filtre.createdAt.$lte = new Date(dateFin);
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [commandes, total] = await Promise.all([
      Commande.find(filtre, PROJECTION_LISTE)
        .populate('acheteur', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Commande.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        commandes,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getCommandes:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/commandes/:id
   Détail complet d'une commande.
───────────────────────────────────────────────────────────────────────────── */
export const getCommandeParId = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const commande = await Commande.findById(req.params.id)
      .populate('acheteur', 'fullName email phone avatar createdAt')
      .populate('lignes.produit', 'nom reference photos slug')
      .populate('lignes.vendeur', 'nomEntreprise emailContact')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({ success: true, data: { commande } });
  } catch (erreur) {
    console.error('Erreur getCommandeParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/commandes/:id/statut
   Change le statut d'une commande.
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutCommande = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { statut, raison = '' } = req.body;

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    commande.statut = statut;

    /* Met à jour la date correspondante */
    const maintenant = new Date();
    if (statut === 'payee')    commande.payeeAt   = maintenant;
    if (statut === 'expediee') commande.expedieeAt = maintenant;
    if (statut === 'livree')   commande.livreeAt   = maintenant;
    if (statut === 'annulee')  commande.annuleeAt  = maintenant;

    /* Historique */
    commande.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:    raison.trim().slice(0, 300),
      modifieAt: maintenant,
    });

    await commande.save();

    const miseAJour = await Commande.findById(commande._id)
      .populate('acheteur', 'fullName email phone')
      .populate('lignes.produit', 'nom reference photos')
      .populate('lignes.vendeur', 'nomEntreprise')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}.`,
      data: { commande: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/commandes/:id/notes
   Mise à jour des notes internes de l'administrateur.
───────────────────────────────────────────────────────────────────────────── */
export const modifierNotesCommande = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { notesAdmin = '' } = req.body;

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { notesAdmin: notesAdmin.trim().slice(0, 500) },
      { new: true, runValidators: true }
    )
      .populate('acheteur', 'fullName email')
      .lean();

    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notes mises à jour.',
      data: { commande },
    });
  } catch (erreur) {
    console.error('Erreur modifierNotesCommande:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
