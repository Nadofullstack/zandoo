import Publicite from '../../models/Publicite.js';
import { validationResult } from 'express-validator';

function getErreurs(req) {
  const e = validationResult(req);
  return e.isEmpty() ? null : e.array();
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/publicites/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesPublicites = async (_req, res) => {
  try {
    const [brouillons, actives, pausees, expirees, total] = await Promise.all([
      Publicite.countDocuments({ statut: 'brouillon' }),
      Publicite.countDocuments({ statut: 'active'    }),
      Publicite.countDocuments({ statut: 'pausee'    }),
      Publicite.countDocuments({ statut: 'expiree'   }),
      Publicite.countDocuments(),
    ]);

    const aggr = await Publicite.aggregate([
      { $group: { _id: null, impressions: { $sum: '$impressions' }, clics: { $sum: '$clics' } } },
    ]);
    const { impressions = 0, clics = 0 } = aggr[0] ?? {};

    return res.status(200).json({
      success: true,
      data: { statistiques: { brouillons, actives, pausees, expirees, total, impressions, clics } },
    });
  } catch (err) {
    console.error('Erreur getStatistiquesPublicites:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/publicites
───────────────────────────────────────────────────────────────────────────── */
export const getPublicites = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { statut, type, emplacement, page = 1, limite = 15 } = req.query;
    const filtre = {};
    if (statut)      filtre.statut      = statut;
    if (type)        filtre.type        = type;
    if (emplacement) filtre.emplacement = emplacement;

    const saut = (Number(page) - 1) * Number(limite);
    const [publicites, total] = await Promise.all([
      Publicite.find(filtre)
        .populate('creePar', 'fullName email')
        .populate('produit', 'nom reference')
        .populate('vendeur', 'nomEntreprise')
        .sort({ ordre: 1, createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Publicite.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        publicites,
        pagination: { total, page: Number(page), limite: Number(limite), totalPages: Math.ceil(total / Number(limite)) },
      },
    });
  } catch (err) {
    console.error('Erreur getPublicites:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/publicites/:id
───────────────────────────────────────────────────────────────────────────── */
export const getPubliciteParId = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const pub = await Publicite.findById(req.params.id)
      .populate('creePar', 'fullName email')
      .populate('produit', 'nom reference photos')
      .populate('vendeur', 'nomEntreprise emailContact')
      .lean();

    if (!pub) return res.status(404).json({ success: false, message: 'Publicité introuvable.' });
    return res.status(200).json({ success: true, data: { publicite: pub } });
  } catch (err) {
    console.error('Erreur getPubliciteParId:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/publicites
───────────────────────────────────────────────────────────────────────────── */
export const creerPublicite = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const pub = await Publicite.create({ ...req.body, creePar: req.user._id });
    return res.status(201).json({ success: true, message: 'Publicité créée.', data: { publicite: pub } });
  } catch (err) {
    console.error('Erreur creerPublicite:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/admin/publicites/:id
───────────────────────────────────────────────────────────────────────────── */
export const modifierPublicite = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const champs = ['titre','type','emplacement','imageUrl','lienCible','texteAlt',
                    'produit','vendeur','dateDebut','dateFin','statut','ordre'];
    const mise_a_jour = {};
    champs.forEach((c) => { if (req.body[c] !== undefined) mise_a_jour[c] = req.body[c]; });

    const pub = await Publicite.findByIdAndUpdate(req.params.id, mise_a_jour, { new: true, runValidators: true })
      .populate('creePar', 'fullName email')
      .lean();

    if (!pub) return res.status(404).json({ success: false, message: 'Publicité introuvable.' });
    return res.status(200).json({ success: true, message: 'Publicité mise à jour.', data: { publicite: pub } });
  } catch (err) {
    console.error('Erreur modifierPublicite:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/publicites/:id
───────────────────────────────────────────────────────────────────────────── */
export const supprimerPublicite = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const pub = await Publicite.findByIdAndDelete(req.params.id);
    if (!pub) return res.status(404).json({ success: false, message: 'Publicité introuvable.' });
    return res.status(200).json({ success: true, message: 'Publicité supprimée.' });
  } catch (err) {
    console.error('Erreur supprimerPublicite:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
