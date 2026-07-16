import slugify from 'slugify';
import Categorie from '../../models/Categorie.js';
import Produit from '../../models/Produit.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

/**
 * Génère un slug unique à partir d'un nom.
 * Ajoute un suffixe numérique si le slug existe déjà.
 */
async function genererSlugUnique(nom, idExclure = null) {
  const base = slugify(nom, { lower: true, strict: true, locale: 'fr' });
  let slug = base;
  let compteur = 1;

  while (true) {
    const filtre = { slug };
    if (idExclure) filtre._id = { $ne: idExclure };
    const existe = await Categorie.findOne(filtre).lean();
    if (!existe) break;
    slug = `${base}-${compteur++}`;
  }

  return slug;
}

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/categories
   Liste toutes les catégories avec leurs sous-catégories imbriquées.
───────────────────────────────────────────────────────────────────────────── */
export const getCategories = async (_req, res) => {
  try {
    /* Récupère toutes les catégories triées par ordre */
    const toutes = await Categorie.find()
      .sort({ ordre: 1, nom: 1 })
      .lean();

    /* Construit l'arborescence */
    const racines = toutes.filter((c) => !c.parent);
    const sousCategories = toutes.filter((c) => c.parent);

    const arbre = racines.map((racine) => ({
      ...racine,
      sousCategories: sousCategories.filter(
        (sc) => String(sc.parent) === String(racine._id)
      ),
    }));

    return res.status(200).json({
      success: true,
      data: { categories: arbre },
    });
  } catch (erreur) {
    console.error('Erreur getCategories:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/categories/liste-plate
   Liste plate (sans imbrication) — pour les selects dans les formulaires produit.
───────────────────────────────────────────────────────────────────────────── */
export const getCategoriesPlates = async (_req, res) => {
  try {
    const categories = await Categorie.find({ active: true })
      .select('nom slug parent attributs')
      .sort({ nom: 1 })
      .lean();

    return res.status(200).json({ success: true, data: { categories } });
  } catch (erreur) {
    console.error('Erreur getCategoriesPlates:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/categories/:id
───────────────────────────────────────────────────────────────────────────── */
export const getCategorieParId = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id)
      .populate('parent', 'nom slug')
      .lean();

    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    }

    return res.status(200).json({ success: true, data: { categorie } });
  } catch (erreur) {
    console.error('Erreur getCategorieParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/categories
   Créer une nouvelle catégorie.
───────────────────────────────────────────────────────────────────────────── */
export const creerCategorie = async (req, res) => {
  try {
    const { nom, description, parent, image, attributs, ordre } = req.body;

    if (!nom?.trim()) {
      return res.status(422).json({ success: false, message: 'Le nom est requis.' });
    }

    const slug = await genererSlugUnique(nom);

    const categorie = await Categorie.create({
      nom: nom.trim(),
      slug,
      description: description?.trim() ?? '',
      parent: parent || null,
      image: image || null,
      attributs: attributs ?? [],
      ordre: ordre ?? 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès.',
      data: { categorie },
    });
  } catch (erreur) {
    console.error('Erreur creerCategorie:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/admin/categories/:id
   Modifier une catégorie existante.
───────────────────────────────────────────────────────────────────────────── */
export const modifierCategorie = async (req, res) => {
  try {
    const { nom, description, parent, image, attributs, active, ordre } = req.body;

    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    }

    /* Empêche une catégorie d'être son propre parent */
    if (parent && String(parent) === String(categorie._id)) {
      return res.status(422).json({
        success: false,
        message: 'Une catégorie ne peut pas être son propre parent.',
      });
    }

    if (nom && nom.trim() !== categorie.nom) {
      categorie.slug = await genererSlugUnique(nom, categorie._id);
      categorie.nom = nom.trim();
    }

    if (description !== undefined) categorie.description = description.trim();
    if (parent !== undefined)      categorie.parent     = parent || null;
    if (image !== undefined)       categorie.image      = image || null;
    if (attributs !== undefined)   categorie.attributs  = attributs;
    if (active !== undefined)      categorie.active     = active;
    if (ordre !== undefined)       categorie.ordre      = ordre;

    await categorie.save();

    return res.status(200).json({
      success: true,
      message: 'Catégorie mise à jour.',
      data: { categorie },
    });
  } catch (erreur) {
    console.error('Erreur modifierCategorie:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/categories/:id
   Supprimer une catégorie — bloqué si des produits ou sous-catégories existent.
───────────────────────────────────────────────────────────────────────────── */
export const supprimerCategorie = async (req, res) => {
  try {
    const categorie = await Categorie.findById(req.params.id);
    if (!categorie) {
      return res.status(404).json({ success: false, message: 'Catégorie introuvable.' });
    }

    /* Vérifie s'il existe des sous-catégories */
    const nbSousCategories = await Categorie.countDocuments({ parent: categorie._id });
    if (nbSousCategories > 0) {
      return res.status(409).json({
        success: false,
        message: `Impossible de supprimer : ${nbSousCategories} sous-catégorie(s) dépendante(s).`,
      });
    }

    /* Vérifie s'il existe des produits dans cette catégorie */
    const nbProduits = await Produit.countDocuments({ categorie: categorie._id });
    if (nbProduits > 0) {
      return res.status(409).json({
        success: false,
        message: `Impossible de supprimer : ${nbProduits} produit(s) rattaché(s) à cette catégorie.`,
      });
    }

    await categorie.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Catégorie supprimée avec succès.',
    });
  } catch (erreur) {
    console.error('Erreur supprimerCategorie:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
