import Reclamation from '../../models/Reclamation.js';
import { validationResult } from 'express-validator';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/** Projection liste */
const PROJECTION_LISTE = {
  messages: 0,
  notesAdmin: 0,
  historiqueStatut: 0,
};

/** Retourne les erreurs de validation ou null */
function getErreurs(req) {
  const erreurs = validationResult(req);
  return erreurs.isEmpty() ? null : erreurs.array();
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/reclamations/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesReclamations = async (_req, res) => {
  try {
    const [ouverts, enCours, enAttente, resolus, fermes, total] = await Promise.all([
      Reclamation.countDocuments({ statut: 'ouvert' }),
      Reclamation.countDocuments({ statut: 'en_cours' }),
      Reclamation.countDocuments({ statut: 'en_attente_reponse' }),
      Reclamation.countDocuments({ statut: 'resolu' }),
      Reclamation.countDocuments({ statut: 'ferme' }),
      Reclamation.countDocuments(),
    ]);

    /* Tickets urgents non résolus */
    const urgents = await Reclamation.countDocuments({
      priorite: 'urgente',
      statut:   { $nin: ['resolu', 'ferme'] },
    });

    return res.status(200).json({
      success: true,
      data: {
        statistiques: { ouverts, enCours, enAttente, resolus, fermes, total, urgents },
      },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesReclamations:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/reclamations
   Liste paginée avec filtres.
───────────────────────────────────────────────────────────────────────────── */
export const getReclamations = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const {
      statut,
      priorite,
      categorie,
      recherche = '',
      assigneA,
      page   = 1,
      limite = 15,
    } = req.query;

    const filtre = {};

    if (statut)    filtre.statut   = statut;
    if (priorite)  filtre.priorite = priorite;
    if (categorie) filtre.categorie = categorie;
    if (assigneA)  filtre.assigneA = assigneA === 'non_assigne' ? null : assigneA;

    if (recherche.trim()) {
      const regex = new RegExp(recherche.trim(), 'i');
      filtre.$or = [{ numero: regex }, { sujet: regex }];
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [reclamations, total] = await Promise.all([
      Reclamation.find(filtre, PROJECTION_LISTE)
        .populate('utilisateur', 'fullName email phone role')
        .populate('assigneA',    'fullName email')
        .populate('commande',    'numero total statut')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Reclamation.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reclamations,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getReclamations:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/reclamations/:id
   Détail complet d'un ticket.
───────────────────────────────────────────────────────────────────────────── */
export const getReclamationParId = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const reclamation = await Reclamation.findById(req.params.id)
      .populate('utilisateur', 'fullName email phone avatar role createdAt')
      .populate('assigneA',    'fullName email avatar')
      .populate('commande',    'numero total statut createdAt lignes')
      .populate('messages.auteur', 'fullName email avatar role')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!reclamation) {
      return res.status(404).json({ success: false, message: 'Réclamation introuvable.' });
    }

    return res.status(200).json({ success: true, data: { reclamation } });
  } catch (erreur) {
    console.error('Erreur getReclamationParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/reclamations/:id/statut
   Change le statut du ticket.
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutReclamation = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { statut, raison = '' } = req.body;

    const reclamation = await Reclamation.findById(req.params.id);
    if (!reclamation) {
      return res.status(404).json({ success: false, message: 'Réclamation introuvable.' });
    }

    reclamation.statut = statut;

    const maintenant = new Date();
    if (statut === 'resolu') reclamation.resoluAt = maintenant;
    if (statut === 'ferme')  reclamation.fermeAt  = maintenant;

    reclamation.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:    raison.trim().slice(0, 300),
      modifieAt: maintenant,
    });

    await reclamation.save();

    const miseAJour = await Reclamation.findById(reclamation._id)
      .populate('utilisateur', 'fullName email')
      .populate('assigneA',    'fullName email')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}.`,
      data: { reclamation: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutReclamation:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/reclamations/:id/messages
   Ajoute un message dans le fil de discussion.
───────────────────────────────────────────────────────────────────────────── */
export const ajouterMessage = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { contenu, piecesJointes = [] } = req.body;

    const reclamation = await Reclamation.findById(req.params.id);
    if (!reclamation) {
      return res.status(404).json({ success: false, message: 'Réclamation introuvable.' });
    }

    /* Passe automatiquement en "en_cours" si le ticket est ouvert */
    if (reclamation.statut === 'ouvert') {
      reclamation.statut = 'en_cours';
      reclamation.historiqueStatut.push({
        statut:    'en_cours',
        modifiePar: req.user._id,
        raison:    'Première réponse admin.',
        modifieAt: new Date(),
      });
    }

    reclamation.messages.push({
      auteur:       req.user._id,
      roleAuteur:   'admin',
      contenu:      contenu.trim(),
      piecesJointes: piecesJointes.slice(0, 5), // max 5 pièces jointes
    });

    await reclamation.save();

    const miseAJour = await Reclamation.findById(reclamation._id)
      .populate('utilisateur', 'fullName email')
      .populate('messages.auteur', 'fullName email avatar role')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Message envoyé.',
      data: { reclamation: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur ajouterMessage:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/reclamations/:id/assigner
   Assigne le ticket à un administrateur.
───────────────────────────────────────────────────────────────────────────── */
export const assignerReclamation = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { adminId } = req.body;

    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      { assigneA: adminId ?? null },
      { new: true, runValidators: true }
    )
      .populate('utilisateur', 'fullName email')
      .populate('assigneA',    'fullName email')
      .lean();

    if (!reclamation) {
      return res.status(404).json({ success: false, message: 'Réclamation introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: adminId ? 'Ticket assigné.' : 'Assignation retirée.',
      data: { reclamation },
    });
  } catch (erreur) {
    console.error('Erreur assignerReclamation:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/reclamations/:id/priorite
   Change la priorité du ticket.
───────────────────────────────────────────────────────────────────────────── */
export const modifierPriorite = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { priorite } = req.body;

    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      { priorite },
      { new: true, runValidators: true }
    )
      .populate('utilisateur', 'fullName email')
      .lean();

    if (!reclamation) {
      return res.status(404).json({ success: false, message: 'Réclamation introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: `Priorité mise à jour : ${priorite}.`,
      data: { reclamation },
    });
  } catch (erreur) {
    console.error('Erreur modifierPriorite:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/reclamations/:id/notes
   Notes internes admin.
───────────────────────────────────────────────────────────────────────────── */
export const modifierNotesAdmin = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { notesAdmin = '' } = req.body;

    const reclamation = await Reclamation.findByIdAndUpdate(
      req.params.id,
      { notesAdmin: notesAdmin.trim().slice(0, 500) },
      { new: true, runValidators: true }
    )
      .populate('utilisateur', 'fullName email')
      .lean();

    if (!reclamation) {
      return res.status(404).json({ success: false, message: 'Réclamation introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notes mises à jour.',
      data: { reclamation },
    });
  } catch (erreur) {
    console.error('Erreur modifierNotesAdmin:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
