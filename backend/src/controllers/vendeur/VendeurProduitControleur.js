import Produit from '../../models/Produit.js';
import Vendeur from '../../models/Vendeur.js';
import Categorie from '../../models/Categorie.js';
import slugify from 'slugify';
import { genererIconeCategorie } from '../acheteur/CatalogueControleur.js';

/* ── Helper génération référence : AAAA-MM-JJ-NNNN ──────────────────────── */
const genererReference = async () => {
  const maintenant = new Date();
  const annee = maintenant.getFullYear();
  const mois  = String(maintenant.getMonth() + 1).padStart(2, '0');
  const jour  = String(maintenant.getDate()).padStart(2, '0');
  const prefixe = `${annee}-${mois}-${jour}`;

  // Compte les produits créés aujourd'hui pour obtenir le prochain numéro
  const debutJour = new Date(annee, maintenant.getMonth(), maintenant.getDate(), 0, 0, 0);
  const finJour   = new Date(annee, maintenant.getMonth(), maintenant.getDate(), 23, 59, 59, 999);
  const compte = await Produit.countDocuments({
    createdAt: { $gte: debutJour, $lte: finJour },
  });
  const numero = String(compte + 1).padStart(4, '0');
  return `${prefixe}-${numero}`;
};

const genererSlugUnique = async (nom) => {
  const base = slugify(nom, { lower: true, strict: true });
  let slug = base;
  let compteur = 1;
  while (await Produit.exists({ slug })) {
    slug = `${base}-${compteur++}`;
  }
  return slug;
};

/* ── Helper vendeur depuis userId ───────────────────────────────────────── */
/**
 * Retourne l'_id Mongoose du vendeur si approuvé.
 * En cas d'erreur retourne { erreur: string }.
 */
const getVendeurId = async (userId) => {
  const v = await Vendeur.findOne({ utilisateur: userId }).select('_id statut');
  if (!v) return { erreur: 'Aucune boutique trouvée pour ce compte.' };
  if (v.statut !== 'approuve') return { erreur: `Boutique non approuvée (statut : ${v.statut}).` };
  return v._id;
};

/** Vérifie si le résultat de getVendeurId est une erreur */
const estErreurVendeur = (val) => val && typeof val === 'object' && 'erreur' in val;

/**
 * GET /api/vendeur/produits
 * Liste des produits du vendeur connecté avec pagination.
 */
export const getMesProduits = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const { page = 1, limite = 20, statut, recherche = '' } = req.query;
    const filtre = { vendeur: vendeurId };
    if (statut) filtre.statut = statut;
    if (recherche.trim()) {
      filtre.$or = [
        { nom: new RegExp(recherche.trim(), 'i') },
        { reference: new RegExp(recherche.trim(), 'i') },
      ];
    }

    const saut = (Number(page) - 1) * Number(limite);
    const [produits, total] = await Promise.all([
      Produit.find(filtre)
        .populate('categorie', 'nom slug')
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
          total, page: Number(page), limite: Number(limite),
          totalPages: Math.ceil(total / Number(limite)),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getMesProduits:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * GET /api/vendeur/produits/statistiques
 * Compteurs rapides pour le tableau de bord.
 */
export const getStatistiquesProduits = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const [enStock, enRupture, faible, total] = await Promise.all([
      Produit.countDocuments({ vendeur: vendeurId, statut: 'en_stock' }),
      Produit.countDocuments({ vendeur: vendeurId, statut: 'en_rupture' }),
      Produit.countDocuments({ vendeur: vendeurId, statut: 'faible' }),
      Produit.countDocuments({ vendeur: vendeurId }),
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

/**
 * POST /api/vendeur/produits
 * Crée un nouveau produit pour la boutique du vendeur.
 * La référence est générée automatiquement : AAAA-MM-JJ-NNNN
 */
export const creerProduit = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const {
      nom, description, categorie,
      prix, prixPromotionnel, quantiteDisponible,
      photoCouverture, variantesPhotos, video,
      variantes, attributs, statut,
    } = req.body;

    const slug      = await genererSlugUnique(nom);
    const reference = await genererReference();

    /* Auto-génère l'icône de la catégorie si elle n'en a pas encore */
    try {
      const cat = await Categorie.findById(categorie).select('nom icone').lean();
      if (cat && !cat.icone) {
        await Categorie.findByIdAndUpdate(categorie, {
          icone: genererIconeCategorie(cat.nom),
        });
      }
    } catch (_) { /* Non bloquant */ }

    /* Calcul automatique du statut selon la quantité */
    const qte = Number(quantiteDisponible);
    const statutCalcule = qte === 0 ? 'en_rupture' : qte <= 4 ? 'faible' : 'en_stock';

    const produit = await Produit.create({
      nom: nom.trim(),
      slug,
      description: description.trim(),
      reference,
      categorie,
      vendeur: vendeurId,
      prix: Number(prix),
      prixPromotionnel: prixPromotionnel ? Number(prixPromotionnel) : null,
      quantiteDisponible: qte,
      enStock: qte > 0,
      photoCouverture: photoCouverture || null,
      variantesPhotos: variantesPhotos || [],
      video: video || null,
      variantes: variantes || [],
      attributs: attributs || [],
      statut: statutCalcule,
    });

    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès.',
      data: { produit },
    });
  } catch (erreur) {
    console.error('Erreur creerProduit vendeur:', erreur);
    if (erreur.code === 11000) {
      return res.status(409).json({ success: false, message: 'Un produit avec cette référence existe déjà.' });
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * GET /api/vendeur/produits/:id
 * Détail d'un produit appartenant au vendeur.
 */
export const getProduitParId = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const produit = await Produit.findOne({ _id: req.params.id, vendeur: vendeurId })
      .populate('categorie', 'nom slug attributs')
      .lean();

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({ success: true, data: { produit } });
  } catch (erreur) {
    console.error('Erreur getProduitParId vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * PUT /api/vendeur/produits/:id
 * Modifie un produit appartenant au vendeur.
 * La référence ne peut pas être modifiée (générée à la création).
 */
export const modifierProduit = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const produit = await Produit.findOne({ _id: req.params.id, vendeur: vendeurId });
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    const champs = [
      'nom', 'description', 'categorie', 'prix', 'prixPromotionnel',
      'quantiteDisponible', 'photoCouverture', 'variantesPhotos',
      'video', 'variantes', 'attributs', 'statut',
    ];

    for (const champ of champs) {
      if (req.body[champ] !== undefined) {
        produit[champ] = req.body[champ];
      }
    }

    if (req.body.quantiteDisponible !== undefined) {
      const qteModif = Number(req.body.quantiteDisponible);
      produit.enStock = qteModif > 0;
      /* Recalcul automatique du statut si la quantité change,
         sauf si le vendeur a explicitement fourni un statut dans la même requête */
      if (req.body.statut === undefined) {
        produit.statut = qteModif === 0 ? 'en_rupture' : qteModif <= 4 ? 'faible' : 'en_stock';
      }
    }

    // Regénérer le slug si le nom a changé
    if (req.body.nom && req.body.nom.trim() !== produit.nom) {
      produit.slug = await genererSlugUnique(req.body.nom.trim());
    }

    await produit.save();

    return res.status(200).json({
      success: true,
      message: 'Produit mis à jour.',
      data: { produit },
    });
  } catch (erreur) {
    console.error('Erreur modifierProduit vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * DELETE /api/vendeur/produits/:id
 * Supprime un produit appartenant au vendeur.
 */
export const supprimerProduit = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const produit = await Produit.findOneAndDelete({ _id: req.params.id, vendeur: vendeurId });
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({ success: true, message: 'Produit supprimé.' });
  } catch (erreur) {
    console.error('Erreur supprimerProduit vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * PATCH /api/vendeur/produits/:id/statut
 * Le vendeur peut marquer son produit en stock, faible ou en rupture.
 */
export const modifierStatutProduit = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const { statut } = req.body;
    const STATUTS_VALIDES = ['en_stock', 'faible', 'en_rupture'];
    if (!STATUTS_VALIDES.includes(statut)) {
      return res.status(422).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}.`,
      });
    }

    const produit = await Produit.findOneAndUpdate(
      { _id: req.params.id, vendeur: vendeurId },
      { statut, enStock: statut !== 'en_rupture' },
      { returnDocument: 'after', runValidators: true }
    ).populate('categorie', 'nom slug').lean();

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: `Statut mis à jour : ${statut}.`,
      data: { produit },
    });
  } catch (erreur) {
    console.error('Erreur modifierStatutProduit vendeur:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * PATCH /api/vendeur/produits/:id/stock
 * Met à jour uniquement le stock d'un produit.
 */
export const mettreAJourStock = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (estErreurVendeur(vendeurId)) {
      return res.status(403).json({ success: false, message: vendeurId.erreur });
    }

    const { quantiteDisponible } = req.body;
    if (quantiteDisponible === undefined || !Number.isInteger(Number(quantiteDisponible)) || Number(quantiteDisponible) < 0) {
      return res.status(422).json({ success: false, message: 'Quantité invalide (entier ≥ 0).' });
    }

    const qte = Number(quantiteDisponible);
    const statut = qte === 0 ? 'en_rupture' : qte <= 5 ? 'faible' : 'en_stock';

    const produit = await Produit.findOneAndUpdate(
      { _id: req.params.id, vendeur: vendeurId },
      { quantiteDisponible: qte, enStock: qte > 0, statut },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Stock mis à jour.',
      data: { produit },
    });
  } catch (erreur) {
    console.error('Erreur mettreAJourStock:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
