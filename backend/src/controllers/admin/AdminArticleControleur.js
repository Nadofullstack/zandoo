import Article from '../../models/Article.js';
import { validationResult } from 'express-validator';

function getErreurs(req) {
  const e = validationResult(req);
  return e.isEmpty() ? null : e.array();
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/articles/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesArticles = async (_req, res) => {
  try {
    const [brouillons, publies, archives, total] = await Promise.all([
      Article.countDocuments({ statut: 'brouillon' }),
      Article.countDocuments({ statut: 'publie'    }),
      Article.countDocuments({ statut: 'archive'   }),
      Article.countDocuments(),
    ]);
    const aggr = await Article.aggregate([{ $group: { _id: null, vues: { $sum: '$vues' } } }]);
    const vues = aggr[0]?.vues ?? 0;

    return res.status(200).json({
      success: true,
      data: { statistiques: { brouillons, publies, archives, total, vues } },
    });
  } catch (err) {
    console.error('Erreur getStatistiquesArticles:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/articles
───────────────────────────────────────────────────────────────────────────── */
export const getArticles = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const { statut, categorieEditoriale, recherche = '', page = 1, limite = 15 } = req.query;
    const filtre = {};
    if (statut)              filtre.statut              = statut;
    if (categorieEditoriale) filtre.categorieEditoriale = categorieEditoriale;
    if (recherche.trim()) {
      const rx = new RegExp(recherche.trim(), 'i');
      filtre.$or = [{ titre: rx }, { tags: rx }];
    }

    const saut = (Number(page) - 1) * Number(limite);
    const [articles, total] = await Promise.all([
      Article.find(filtre, { contenu: 0 })
        .populate('auteur', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Article.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: { total, page: Number(page), limite: Number(limite), totalPages: Math.ceil(total / Number(limite)) },
      },
    });
  } catch (err) {
    console.error('Erreur getArticles:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/articles/:id
───────────────────────────────────────────────────────────────────────────── */
export const getArticleParId = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const article = await Article.findById(req.params.id)
      .populate('auteur', 'fullName email avatar')
      .lean();

    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable.' });
    return res.status(200).json({ success: true, data: { article } });
  } catch (err) {
    console.error('Erreur getArticleParId:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/articles
───────────────────────────────────────────────────────────────────────────── */
export const creerArticle = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const article = await Article.create({ ...req.body, auteur: req.user._id });
    return res.status(201).json({ success: true, message: 'Article créé.', data: { article } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Ce slug est déjà utilisé.' });
    }
    console.error('Erreur creerArticle:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/admin/articles/:id
───────────────────────────────────────────────────────────────────────────── */
export const modifierArticle = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const champs = ['titre','resume','contenu','imageCouverture','categorieEditoriale',
                    'tags','statut','publieAt','metaTitre','metaDescription'];
    const miseAJour = {};
    champs.forEach((c) => { if (req.body[c] !== undefined) miseAJour[c] = req.body[c]; });

    /* Si on publie pour la première fois, on pose la date */
    if (miseAJour.statut === 'publie' && !miseAJour.publieAt) {
      miseAJour.publieAt = new Date();
    }

    const article = await Article.findByIdAndUpdate(req.params.id, miseAJour, { new: true, runValidators: true })
      .populate('auteur', 'fullName email')
      .lean();

    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable.' });
    return res.status(200).json({ success: true, message: 'Article mis à jour.', data: { article } });
  } catch (err) {
    console.error('Erreur modifierArticle:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/articles/:id
───────────────────────────────────────────────────────────────────────────── */
export const supprimerArticle = async (req, res) => {
  const errs = getErreurs(req);
  if (errs) return res.status(422).json({ success: false, errors: errs });

  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable.' });
    return res.status(200).json({ success: true, message: 'Article supprimé.' });
  } catch (err) {
    console.error('Erreur supprimerArticle:', err);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
