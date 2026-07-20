import PageStatique from '../../models/PageStatique.js';
import { validationResult } from 'express-validator';

function getErreurs(req) {
  const e = validationResult(req);
  return e.isEmpty() ? null : e.array();
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/pages-statiques
───────────────────────────────────────────────────────────────────────────── */
export const getPages = async (_req, res) => {
  try {
    const pages = await PageStatique.find()
      .populate('modifiePar', 'fullName email')
      .sort({ ordre: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, data: { pages } });
  } catch (err) {
    console.error('Erreur getPages:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/pages-statiques/:id
───────────────────────────────────────────────────────────────────────────── */
export const getPageParId = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const page = await PageStatique.findById(req.params.id)
      .populate('modifiePar', 'fullName email')
      .lean();

    if (!page) return res.status(404).json({ success: false, message: 'Page introuvable.' });
    return res.status(200).json({ success: true, data: { page } });
  } catch (err) {
    console.error('Erreur getPageParId:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/pages-statiques
───────────────────────────────────────────────────────────────────────────── */
export const creerPage = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const page = await PageStatique.create({ ...req.body, modifiePar: req.user._id });
    return res.status(201).json({ success: true, message: 'Page créée.', data: { page } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ce slug est déjà utilisé.' });
    }
    console.error('Erreur creerPage:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/admin/pages-statiques/:id
───────────────────────────────────────────────────────────────────────────── */
export const modifierPage = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const champs = ['titre', 'contenu', 'metaTitre', 'metaDescription', 'publiee', 'ordre'];
    const miseAJour = { modifiePar: req.user._id };
    champs.forEach((c) => { if (req.body[c] !== undefined) miseAJour[c] = req.body[c]; });

    const page = await PageStatique.findByIdAndUpdate(req.params.id, miseAJour, { new: true, runValidators: true })
      .populate('modifiePar', 'fullName email')
      .lean();

    if (!page) return res.status(404).json({ success: false, message: 'Page introuvable.' });
    return res.status(200).json({ success: true, message: 'Page mise à jour.', data: { page } });
  } catch (err) {
    console.error('Erreur modifierPage:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/pages-statiques/:id
───────────────────────────────────────────────────────────────────────────── */
export const supprimerPage = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const page = await PageStatique.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page introuvable.' });
    return res.status(200).json({ success: true, message: 'Page supprimée.' });
  } catch (err) {
    console.error('Erreur supprimerPage:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
