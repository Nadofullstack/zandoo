import Produit from '../../models/Produit.js';
import Categorie from '../../models/Categorie.js';

/** Projection publique — on n'expose pas les champs internes admin */
const PROJECTION_PUBLIQUE = {
  statut: 0,
  motifRejet: 0,
  notesAdmin: 0,
  historiqueStatut: 0,
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/produits
   Liste paginée des produits en stock avec filtres : catégorie, recherche,
   tri, fourchette de prix.
───────────────────────────────────────────────────────────────────────────── */
export const getProduits = async (req, res) => {
  try {
    const {
      categorie,
      recherche = '',
      tri = 'recent',        // recent | prix_asc | prix_desc | nom_asc
      prixMin,
      prixMax,
      page  = 1,
      limite = 20,
    } = req.query;

    /* Seuls les produits en stock sont visibles */
    const filtre = { statut: 'en_stock' };

    if (categorie) {
      /* Cherche aussi les produits des sous-catégories */
      const sousIds = await Categorie.find({ parent: categorie })
        .select('_id')
        .lean();
      const ids = [categorie, ...sousIds.map((c) => String(c._id))];
      filtre.categorie = { $in: ids };
    }

    if (recherche.trim()) {
      filtre.$text = { $search: recherche.trim() };
    }

    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }

    const TRIS = {
      recent:    { createdAt: -1 },
      prix_asc:  { prix: 1 },
      prix_desc: { prix: -1 },
      nom_asc:   { nom: 1 },
    };
    const triMongo = TRIS[tri] ?? TRIS.recent;

    const saut = (Number(page) - 1) * Number(limite);

    const [produits, total] = await Promise.all([
      Produit.find(filtre, PROJECTION_PUBLIQUE)
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort(triMongo)
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Produit.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        produits,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getProduits (acheteur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/produits/:slug
   Détail d'un produit par son slug (URL SEO-friendly).
───────────────────────────────────────────────────────────────────────────── */
export const getProduitParSlug = async (req, res) => {
  try {
    const produit = await Produit.findOne(
      { slug: req.params.slug, statut: 'en_stock' },
      PROJECTION_PUBLIQUE
    )
      .populate('categorie', 'nom slug attributs')
      .populate('vendeur', 'nomEntreprise logoUrl')
      .lean();

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    /* Produits similaires (même catégorie, jusqu'à 4) */
    const similaires = await Produit.find(
      { statut: 'en_stock', enStock: true, categorie: produit.categorie._id, _id: { $ne: produit._id } },
      PROJECTION_PUBLIQUE
    )
      .select('nom slug photos prix prixPromotionnel categorie')
      .populate('categorie', 'nom slug')
      .limit(4)
      .lean();

    return res.status(200).json({
      success: true,
      data: { produit, similaires },
    });
  } catch (erreur) {
    console.error('Erreur getProduitParSlug:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/categories
   Liste des catégories actives avec arborescence pour la navigation.
───────────────────────────────────────────────────────────────────────────── */
export const getCategories = async (_req, res) => {
  try {
    const toutes = await Categorie.find({ active: true })
      .select('nom slug image parent ordre')
      .sort({ ordre: 1, nom: 1 })
      .lean();

    const racines = toutes.filter((c) => !c.parent);
    const sousCategories = toutes.filter((c) => c.parent);

    const arbre = racines.map((racine) => ({
      ...racine,
      sousCategories: sousCategories.filter(
        (sc) => String(sc.parent) === String(racine._id)
      ),
    }));

    return res.status(200).json({ success: true, data: { categories: arbre } });
  } catch (erreur) {
    console.error('Erreur getCategories (acheteur):', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/categories/:slug/produits
   Produits d'une catégorie donnée par son slug.
───────────────────────────────────────────────────────────────────────────── */
export const getProduitsParCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findOne({ slug: req.params.slug, active: true }).lean();
    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    }

    /* Inclut les sous-catégories */
    const sousIds = await Categorie.find({ parent: categorie._id }).select('_id').lean();
    const ids = [String(categorie._id), ...sousIds.map((c) => String(c._id))];

    const { tri = 'recent', prixMin, prixMax, page = 1, limite = 20 } = req.query;

    const filtre = { statut: 'en_stock', categorie: { $in: ids } };
    if (prixMin || prixMax) {
      filtre.prix = {};
      if (prixMin) filtre.prix.$gte = Number(prixMin);
      if (prixMax) filtre.prix.$lte = Number(prixMax);
    }

    const TRIS = { recent: { createdAt: -1 }, prix_asc: { prix: 1 }, prix_desc: { prix: -1 }, nom_asc: { nom: 1 } };

    const saut = (Number(page) - 1) * Number(limite);
    const [produits, total] = await Promise.all([
      Produit.find(filtre, PROJECTION_PUBLIQUE)
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort(TRIS[tri] ?? TRIS.recent)
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Produit.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        categorie,
        produits,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getProduitsParCategorie:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/recherche?q=...
   Recherche plein texte sur nom, description, référence.
───────────────────────────────────────────────────────────────────────────── */
export const rechercherProduits = async (req, res) => {
  try {
    const { q = '', page = 1, limite = 20 } = req.query;

    if (!q.trim()) {
      return res.status(422).json({ success: false, message: 'Terme de recherche requis.' });
    }

    const filtre = { statut: 'en_stock', $text: { $search: q.trim() } };
    const saut = (Number(page) - 1) * Number(limite);

    const [produits, total] = await Promise.all([
      Produit.find(filtre, { ...PROJECTION_PUBLIQUE, score: { $meta: 'textScore' } })
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ score: { $meta: 'textScore' } })
        .skip(saut)
        .limit(Number(limite))
        .lean(),
      Produit.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        terme: q.trim(),
        produits,
        pagination: {
          total,
          page:       Number(page),
          limite:     Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur rechercherProduits:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
