import slugify from 'slugify';
import Produit from '../../models/Produit.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

const STATUTS_VALIDES = ['en_stock', 'en_rupture', 'faible'];

async function genererSlugUnique(nom, idExclure = null) {
  const base = slugify(nom, { lower: true, strict: true, locale: 'fr' });
  let slug = base;
  let compteur = 1;
  while (true) {
    const filtre = { slug };
    if (idExclure) filtre._id = { $ne: idExclure };
    const existe = await Produit.findOne(filtre).lean();
    if (!existe) break;
    slug = `${base}-${compteur++}`;
  }
  return slug;
}

/** Projection légère pour la liste */
const PROJECTION_LISTE = {
  description: 0,
  attributs: 0,
  historiqueStatut: 0,
  notesAdmin: 0,
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/produits/statistiques
───────────────────────────────────────────────────────────────────────────── */
export const getStatistiquesProduits = async (_req, res) => {
  try {
    const [enStock, enRupture, faible, total] = await Promise.all([
      Produit.countDocuments({ statut: 'en_stock' }),
      Produit.countDocuments({ statut: 'en_rupture' }),
      Produit.countDocuments({ statut: 'faible' }),
      Produit.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: { statistiques: { enStock, enRupture, faible, total } },
    });
  } catch (erreur) {
    console.error('Erreur getStatistiquesProduits:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/produits
   Liste paginée avec filtres : statut, catégorie, vendeur, recherche texte.
───────────────────────────────────────────────────────────────────────────── */
export const getProduits = async (req, res) => {
  try {
    const {
      statut,
      categorie,
      vendeur,
      recherche = '',
      page  = 1,
      limite = 20,
    } = req.query;

    const filtre = {};

    if (statut && STATUTS_VALIDES.includes(statut))    filtre.statut    = statut;
    if (categorie)                                      filtre.categorie = categorie;
    if (vendeur)                                        filtre.vendeur   = vendeur;

    if (recherche.trim()) {
      filtre.$text = { $search: recherche.trim() };
    }

    const saut = (Number(page) - 1) * Number(limite);

    const [produits, total] = await Promise.all([
      Produit.find(filtre, PROJECTION_LISTE)
        .populate('categorie', 'nom slug')
        .populate('vendeur',   'nomEntreprise')
        .sort({ createdAt: -1 })
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
    console.error('Erreur getProduits:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/admin/produits/:id
───────────────────────────────────────────────────────────────────────────── */
export const getProduitParId = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate('categorie', 'nom slug attributs')
      .populate('vendeur',   'nomEntreprise emailContact')
      .populate('historiqueStatut.modifiePar', 'fullName email')
      .lean();

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({ success: true, data: { produit } });
  } catch (erreur) {
    console.error('Erreur getProduitParId:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/admin/produits
   Créer un produit directement depuis l'admin (toujours approuvé).
───────────────────────────────────────────────────────────────────────────── */
export const creerProduit = async (req, res) => {
  try {
    const {
      nom, description, reference, categorie,
      prix, prixPromotionnel, quantiteDisponible, enStock,
      photoCouverture, variantesPhotos, video, variantes, attributs, statut,
    } = req.body;

    const slug = await genererSlugUnique(nom);

    const produit = await Produit.create({
      nom:                nom.trim(),
      slug,
      description:        description.trim(),
      reference:          reference.trim().toUpperCase(),
      categorie,
      prix:               Number(prix),
      prixPromotionnel:   prixPromotionnel ? Number(prixPromotionnel) : null,
      quantiteDisponible: Number(quantiteDisponible),
      enStock:            enStock ?? Number(quantiteDisponible) > 0,
      photoCouverture:    photoCouverture ?? null,
      variantesPhotos:    variantesPhotos ?? [],
      video:              video ?? null,
      variantes:          variantes ?? [],
      attributs:          attributs ?? [],
      statut:             statut ?? 'en_stock',
      historiqueStatut: [{
        statut:     statut ?? 'en_stock',
        modifiePar: req.user._id,
        raison:     'Création par l\'administrateur',
        modifieAt:  new Date(),
      }],
    });

    const peuple = await Produit.findById(produit._id)
      .populate('categorie', 'nom slug')
      .populate('vendeur', 'nomEntreprise')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: { produit: peuple },
    });
  } catch (erreur) {
    console.error('Erreur creerProduit:', erreur);
    if (erreur.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Un produit avec cette référence existe déjà.',
      });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/admin/produits/:id
   Modifier un produit existant.
───────────────────────────────────────────────────────────────────────────── */
export const modifierProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    const champs = [
      'description', 'categorie',
      'prix', 'prixPromotionnel', 'quantiteDisponible', 'enStock',
      'photoCouverture', 'variantesPhotos', 'video', 'variantes', 'attributs',
    ];

    /* Mise à jour du nom + slug si le nom change */
    if (req.body.nom && req.body.nom.trim() !== produit.nom) {
      produit.nom  = req.body.nom.trim();
      produit.slug = await genererSlugUnique(req.body.nom, produit._id);
    }

    /* Mise à jour de la référence si elle change */
    if (req.body.reference && req.body.reference.trim().toUpperCase() !== produit.reference) {
      produit.reference = req.body.reference.trim().toUpperCase();
    }

    for (const champ of champs) {
      if (req.body[champ] !== undefined) {
        produit[champ] = req.body[champ];
      }
    }

    /* Synchronise enStock avec la quantité */
    if (req.body.quantiteDisponible !== undefined) {
      produit.enStock = Number(req.body.quantiteDisponible) > 0;
    }

    await produit.save();

    const miseAJour = await Produit.findById(produit._id)
      .populate('categorie', 'nom slug')
      .populate('vendeur', 'nomEntreprise')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Produit mis à jour.',
      data: { produit: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierProduit:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PATCH /api/admin/produits/:id/statut
   Approuver / Rejeter / Remettre en attente un produit.
───────────────────────────────────────────────────────────────────────────── */
export const modifierStatutProduit = async (req, res) => {
  try {
    const { statut, raison = '' } = req.body;

    if (!STATUTS_VALIDES.includes(statut)) {
      return res.status(422).json({
        success: false,
        message: `Statut invalide. Valeurs : ${STATUTS_VALIDES.join(', ')}.`,
      });
    }

    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    produit.statut = statut;

    produit.historiqueStatut.push({
      statut,
      modifiePar: req.user._id,
      raison:     raison.trim().slice(0, 500),
      modifieAt:  new Date(),
    });

    await produit.save();

    const miseAJour = await Produit.findById(produit._id)
      .populate('categorie', 'nom slug')
      .populate('vendeur', 'nomEntreprise')
      .lean();

    return res.status(200).json({
      success: true,
      message: `Produit ${statut}.`,
      data: { produit: miseAJour },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutProduit:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/admin/produits/:id
───────────────────────────────────────────────────────────────────────────── */
export const supprimerProduit = async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès.',
    });
  } catch (erreur) {
    console.error('Erreur supprimerProduit:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
