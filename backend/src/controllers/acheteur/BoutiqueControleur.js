import mongoose from 'mongoose';
import Vendeur from '../../models/Vendeur.js';
import Produit from '../../models/Produit.js';
import Avis from '../../models/Avis.js';
import Categorie from '../../models/Categorie.js';
import { versAvisPublic } from '../../services/avisService.js';

/**
 * Pages publiques des boutiques (sans authentification).
 *   GET /api/acheteur/boutiques                    — annuaire (recherche, filtres, tri)
 *   GET /api/acheteur/boutiques/:slug              — vitrine d'une boutique
 *   GET /api/acheteur/boutiques/:slug/produits     — produits de la boutique
 *   GET /api/acheteur/boutiques/:slug/avis         — avis clients sur ses produits
 *
 * Seules les boutiques approuvées sont visibles. Aucune donnée de contact
 * ni document administratif n'est exposé.
 */

const STATUTS_DISPONIBLES = ['en_stock', 'faible'];

const CHAMPS_CARTE_PRODUIT =
  'nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock statut noteMoyenne nombreAvis';

const TRIS_BOUTIQUES = {
  populaires: { nombreProduits: -1, nombreAvis: -1, _id: 1 },
  note:       { noteMoyenne: -1, nombreAvis: -1, _id: 1 },
  recentes:   { createdAt: -1, _id: 1 },
  nom:        { nomEntreprise: 1, _id: 1 },
};

const TRIS_PRODUITS = {
  recent:    { createdAt: -1 },
  prix_asc:  { prix: 1 },
  prix_desc: { prix: -1 },
  note:      { noteMoyenne: -1, nombreAvis: -1 },
};

const echapperRegex = (texte) => texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const erreurServeur = (res, contexte, erreur) => {
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

/** Boutique approuvée par slug — ou par identifiant pour les boutiques sans slug (rétrocompatibilité). */
const trouverBoutique = (identifiant, champs) => {
  const filtre = mongoose.isValidObjectId(identifiant)
    ? { $or: [{ slug: String(identifiant).toLowerCase() }, { _id: identifiant }] }
    : { slug: String(identifiant).toLowerCase() };
  return Vendeur.findOne({ ...filtre, statut: 'approuve' }).select(champs).lean();
};

/** Statistiques publiques : produits disponibles et avis publiés. */
const etapesStatistiques = [
  {
    $lookup: {
      from: Produit.collection.name,
      let: { v: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$vendeur', '$$v'] }, statut: { $in: STATUTS_DISPONIBLES } } },
        { $sort: { createdAt: -1 } },
        { $project: { photoCouverture: 1 } },
      ],
      as: '_produits',
    },
  },
  {
    $lookup: {
      from: Avis.collection.name,
      let: { v: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$vendeur', '$$v'] }, statut: 'publie' } },
        { $group: { _id: null, moyenne: { $avg: '$note' }, total: { $sum: 1 } } },
      ],
      as: '_avis',
    },
  },
  {
    $addFields: {
      nombreProduits: { $size: '$_produits' },
      apercu: {
        $slice: [{ $filter: { input: '$_produits.photoCouverture', cond: { $ne: ['$$this', null] } } }, 3],
      },
      noteMoyenne: { $round: [{ $ifNull: [{ $arrayElemAt: ['$_avis.moyenne', 0] }, 0] }, 1] },
      nombreAvis:  { $ifNull: [{ $arrayElemAt: ['$_avis.total', 0] }, 0] },
    },
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/boutiques?recherche=&secteur=&ville=&tri=populaires&page=1
───────────────────────────────────────────────────────────────────────────── */
export const getBoutiques = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(36, Math.max(1, Number(req.query.limite) || 12));

    const filtre = { statut: 'approuve' };
    const recherche = String(req.query.recherche ?? '').trim().slice(0, 80);
    if (recherche) {
      const regex = new RegExp(echapperRegex(recherche), 'i');
      filtre.$or = [{ nomEntreprise: regex }, { secteurActivite: regex }, { descriptionBoutique: regex }];
    }
    if (req.query.secteur) filtre.secteurActivite = String(req.query.secteur).slice(0, 100);
    if (req.query.ville)   filtre['adresse.ville'] = new RegExp(`^${echapperRegex(String(req.query.ville).slice(0, 60))}$`, 'i');

    const [resultat] = await Vendeur.aggregate([
      { $match: filtre },
      ...etapesStatistiques,
      { $sort: TRIS_BOUTIQUES[req.query.tri] ?? TRIS_BOUTIQUES.populaires },
      {
        $facet: {
          boutiques: [
            { $skip: (page - 1) * limite },
            { $limit: limite },
            {
              $project: {
                slug: 1, nomEntreprise: 1, logo: 1, banniere: 1, secteurActivite: 1, createdAt: 1,
                ville: '$adresse.ville',
                description: { $substrCP: [{ $ifNull: ['$descriptionBoutique', ''] }, 0, 140] },
                nombreProduits: 1, apercu: 1, noteMoyenne: 1, nombreAvis: 1,
                retrait: { $ifNull: ['$livraison.retrait.actif', false] },
              },
            },
          ],
          total: [{ $count: 'n' }],
        },
      },
    ]);

    /* Valeurs disponibles pour les filtres (boutiques approuvées uniquement) */
    const [secteurs, villes] = await Promise.all([
      Vendeur.distinct('secteurActivite', { statut: 'approuve', secteurActivite: { $nin: [null, ''] } }),
      Vendeur.distinct('adresse.ville',   { statut: 'approuve', 'adresse.ville': { $nin: [null, ''] } }),
    ]);

    const total = resultat.total[0]?.n ?? 0;
    return res.status(200).json({
      success: true,
      data: {
        boutiques: resultat.boutiques,
        filtres: { secteurs: secteurs.sort(), villes: villes.sort() },
        pagination: { total, page, limite, totalPages: Math.ceil(total / limite) },
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getBoutiques', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/boutiques/:slug
   Vitrine : identité, statistiques, catégories proposées, informations de livraison.
───────────────────────────────────────────────────────────────────────────── */
export const getBoutique = async (req, res) => {
  try {
    const boutique = await trouverBoutique(
      req.params.slug,
      'slug nomEntreprise logo banniere descriptionBoutique secteurActivite adresse.ville createdAt livraison',
    );
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    const [stats, categories, avisStats] = await Promise.all([
      Produit.aggregate([
        { $match: { vendeur: boutique._id, statut: { $in: STATUTS_DISPONIBLES } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            enPromotion: { $sum: { $cond: [{ $and: [{ $gt: ['$prixPromotionnel', 0] }, { $lt: ['$prixPromotionnel', '$prix'] }] }, 1, 0] } },
          },
        },
      ]),
      Produit.aggregate([
        { $match: { vendeur: boutique._id, statut: { $in: STATUTS_DISPONIBLES } } },
        { $group: { _id: '$categorie', nombre: { $sum: 1 } } },
        { $lookup: { from: Categorie.collection.name, localField: '_id', foreignField: '_id', as: 'categorie' } },
        { $unwind: '$categorie' },
        { $project: { _id: '$categorie._id', nom: '$categorie.nom', slug: '$categorie.slug', nombre: 1 } },
        { $sort: { nombre: -1, nom: 1 } },
      ]),
      Avis.aggregate([
        { $match: { vendeur: boutique._id, statut: 'publie' } },
        { $group: { _id: null, moyenne: { $avg: '$note' }, total: { $sum: 1 } } },
      ]),
    ]);

    /* Livraison : uniquement ce qui aide l'acheteur à décider */
    const l = boutique.livraison;
    const livraison = !l?.configuree
      ? { configuree: false, domicile: true, retrait: null, zones: [], autresVilles: true, gratuiteDes: null }
      : {
          configuree:   true,
          domicile:     !!l.domicile?.actif,
          zones:        l.domicile?.actif ? l.domicile.zones.map((z) => ({ nom: z.nom, villes: z.villes, tarif: z.tarif, delaiMin: z.delaiMin, delaiMax: z.delaiMax })) : [],
          autresVilles: l.domicile?.actif && l.domicile.tarifAutresVilles !== null,
          gratuiteDes:  l.domicile?.actif ? l.domicile.gratuiteDes : null,
          retrait:      l.retrait?.actif ? { adresse: l.retrait.adresse, ville: l.retrait.ville, horaires: l.retrait.horaires } : null,
        };

    return res.status(200).json({
      success: true,
      data: {
        boutique: {
          _id:             boutique._id,
          slug:            boutique.slug ?? String(boutique._id),
          nomEntreprise:   boutique.nomEntreprise,
          logo:            boutique.logo,
          banniere:        boutique.banniere,
          description:     boutique.descriptionBoutique ?? '',
          secteurActivite: boutique.secteurActivite ?? '',
          ville:           boutique.adresse?.ville ?? '',
          membreDepuis:    boutique.createdAt,
          nombreProduits:  stats[0]?.total ?? 0,
          enPromotion:     stats[0]?.enPromotion ?? 0,
          noteMoyenne:     avisStats[0] ? Math.round(avisStats[0].moyenne * 10) / 10 : 0,
          nombreAvis:      avisStats[0]?.total ?? 0,
          categories,
          livraison,
        },
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getBoutique', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/boutiques/:slug/produits?categorie=<id>&recherche=&tri=recent&promo=1&page=1
───────────────────────────────────────────────────────────────────────────── */
export const getProduitsBoutique = async (req, res) => {
  try {
    const boutique = await trouverBoutique(req.params.slug, '_id');
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(48, Math.max(1, Number(req.query.limite) || 20));

    const filtre = { vendeur: boutique._id, statut: { $in: STATUTS_DISPONIBLES } };
    if (mongoose.isValidObjectId(req.query.categorie)) filtre.categorie = req.query.categorie;
    const recherche = String(req.query.recherche ?? '').trim().slice(0, 80);
    if (recherche) filtre.nom = new RegExp(echapperRegex(recherche), 'i');
    if (req.query.promo === '1') {
      filtre.prixPromotionnel = { $gt: 0 };
      filtre.$expr = { $lt: ['$prixPromotionnel', '$prix'] };
    }

    const [produits, total] = await Promise.all([
      Produit.find(filtre)
        .select(CHAMPS_CARTE_PRODUIT)
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort(TRIS_PRODUITS[req.query.tri] ?? TRIS_PRODUITS.recent)
        .skip((page - 1) * limite)
        .limit(limite)
        .lean(),
      Produit.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: { produits, pagination: { total, page, limite, totalPages: Math.ceil(total / limite) } },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getProduitsBoutique', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/boutiques/:slug/avis?page=1
   Derniers avis publiés sur les produits de la boutique (avec le produit concerné).
───────────────────────────────────────────────────────────────────────────── */
export const getAvisBoutiquePublic = async (req, res) => {
  try {
    const boutique = await trouverBoutique(req.params.slug, '_id');
    if (!boutique) return res.status(404).json({ success: false, message: 'Boutique introuvable.' });

    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(20, Math.max(1, Number(req.query.limite) || 6));
    const filtre = { vendeur: boutique._id, statut: 'publie' };

    const [avis, total] = await Promise.all([
      Avis.find(filtre)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limite)
        .limit(limite)
        .populate('acheteur', 'fullName')
        .populate('produit', 'nom slug photoCouverture')
        .lean(),
      Avis.countDocuments(filtre),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        avis: avis.map((a) => ({ ...versAvisPublic(a), produit: a.produit ?? null })),
        pagination: { total, page, limite, totalPages: Math.ceil(total / limite) },
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getAvisBoutiquePublic', erreur);
  }
};
