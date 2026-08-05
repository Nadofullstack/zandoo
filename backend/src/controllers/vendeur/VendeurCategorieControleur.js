import slugify from 'slugify';
import Categorie from '../../models/Categorie.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helper slug unique
───────────────────────────────────────────────────────────────────────────── */
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
   GET /api/vendeur/categories
   Liste plate des catégories actives — pour les selects dans le formulaire produit.
───────────────────────────────────────────────────────────────────────────── */
export const getCategoriesPlates = async (_req, res) => {
  try {
    const categories = await Categorie.find({ active: true })
      .select('nom slug parent attributs')
      .sort({ nom: 1 })
      .lean();

    return res.status(200).json({ success: true, data: { categories } });
  } catch (erreur) {
    console.error('Erreur getCategoriesPlates vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/vendeur/categories
   Créer une nouvelle catégorie — accessible aux vendeurs approuvés.
───────────────────────────────────────────────────────────────────────────── */
export const creerCategorie = async (req, res) => {
  try {
    const { nom, description, parent, image, attributs, ordre } = req.body;

    if (!nom?.trim()) {
      return res.status(422).json({ success: false, message: 'Le nom est requis.' });
    }

    const slug = await genererSlugUnique(nom);

    const categorie = await Categorie.create({
      nom:         nom.trim(),
      slug,
      description: description?.trim() ?? '',
      parent:      parent || null,
      image:       image || null,
      attributs:   attributs ?? [],
      ordre:       ordre ?? 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès.',
      data: { categorie },
    });
  } catch (erreur) {
    console.error('Erreur creerCategorie vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
