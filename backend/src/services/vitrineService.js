import Produit from '../models/Produit.js';
import Publicite from '../models/Publicite.js';

/**
 * Contenus « vitrine » de la page d'accueil : campagnes publicitaires actives
 * et meilleures promotions. Les données sont mises en forme pour l'affichage
 * public (aucun champ interne : titre admin, statistiques, auteur…).
 */

export const EMPLACEMENTS_ACCUEIL = ['accueil_haut', 'accueil_milieu'];

const CHAMPS_CARTE_PRODUIT =
  'nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock statut noteMoyenne nombreAvis';

/** Forme publique d'une campagne (lien et visuel résolus selon son type). */
function versPublicitePublique(pub) {
  const produit = pub.produit;
  const vendeur = pub.vendeur;

  const imageUrl = pub.imageUrl
    || (pub.type === 'mise_en_avant_produit' ? produit?.photoCouverture : null)
    || (pub.type === 'mise_en_avant_vendeur' ? vendeur?.banniere || vendeur?.logo : null)
    || null;

  const lien = pub.lienCible
    || (produit?.slug ? `/produit/${produit.slug}` : '')
    || '/catalogue';

  return {
    _id:           pub._id,
    type:          pub.type,
    emplacement:   pub.emplacement,
    imageUrl,
    lien,
    texteAlt:      pub.texteAlt || pub.accroche || 'Offre ZANDOO',
    accroche:      pub.accroche,
    description:   pub.description,
    libelleBouton: pub.libelleBouton,
    produit: produit
      ? { nom: produit.nom, prix: produit.prix, prixPromotionnel: produit.prixPromotionnel ?? null }
      : null,
    vendeur: vendeur ? { nomEntreprise: vendeur.nomEntreprise, logo: vendeur.logo ?? null } : null,
  };
}

/**
 * Campagnes actives et dans leur période de diffusion, regroupées par emplacement.
 * Une campagne sans visuel exploitable est ignorée.
 */
export async function getPublicitesAccueil() {
  const maintenant = new Date();

  const pubs = await Publicite.find({
    statut:      'active',
    emplacement: { $in: EMPLACEMENTS_ACCUEIL },
    dateDebut:   { $lte: maintenant },
    dateFin:     { $gte: maintenant },
  })
    .select('type emplacement imageUrl lienCible texteAlt accroche description libelleBouton produit vendeur ordre')
    .populate('produit', 'nom slug photoCouverture prix prixPromotionnel statut')
    .populate('vendeur', 'nomEntreprise logo banniere statut')
    .sort({ ordre: 1, createdAt: -1 })
    .limit(20)
    .lean();

  const publiques = pubs
    /* Le produit ou la boutique mis en avant doit toujours être disponible */
    .filter((p) => !(p.type === 'mise_en_avant_produit' && (!p.produit || p.produit.statut === 'en_rupture')))
    .filter((p) => !(p.type === 'mise_en_avant_vendeur' && (!p.vendeur || p.vendeur.statut !== 'approuve')))
    .map(versPublicitePublique)
    .filter((p) => p.imageUrl);

  return {
    haut:   publiques.filter((p) => p.emplacement === 'accueil_haut').slice(0, 6),
    milieu: publiques.filter((p) => p.emplacement === 'accueil_milieu').slice(0, 3),
  };
}

/** Meilleures promotions en cours (remise décroissante) pour le bandeau de l'accueil. */
export async function getMeilleuresPromotions(limite = 12) {
  const { produits } = await getPromotionsPaginees({ page: 1, limite, tri: 'remise' });
  return produits;
}

/** Filtre des produits disponibles en promotion (prix promo strictement inférieur au prix) */
const FILTRE_PROMOTION = {
  statut:           { $in: ['en_stock', 'faible'] },
  prixPromotionnel: { $gt: 0 },
  $expr:            { $lt: ['$prixPromotionnel', '$prix'] },
};

const TRIS_PROMOTIONS = {
  remise:    { remise: -1, _id: 1 },
  prix_asc:  { prixPromotionnel: 1, _id: 1 },
  prix_desc: { prixPromotionnel: -1, _id: 1 },
  recent:    { updatedAt: -1, _id: 1 },
};

/**
 * Promotions paginées pour la page « Promotions ».
 * La remise est calculée en base, ce qui permet de trier et paginer côté serveur.
 */
export async function getPromotionsPaginees({ page = 1, limite = 24, tri = 'remise', categorie } = {}) {
  const filtre = { ...FILTRE_PROMOTION };
  if (categorie) filtre.categorie = categorie;

  const [resultat] = await Produit.aggregate([
    { $match: filtre },
    { $addFields: { remise: { $round: [{ $multiply: [{ $subtract: [1, { $divide: ['$prixPromotionnel', '$prix'] }] }, 100] }, 0] } } },
    { $sort: TRIS_PROMOTIONS[tri] ?? TRIS_PROMOTIONS.remise },
    {
      $facet: {
        produits: [
          { $skip: (page - 1) * limite },
          { $limit: limite },
          { $project: Object.fromEntries([...CHAMPS_CARTE_PRODUIT.split(' '), 'remise'].map((c) => [c, 1])) },
        ],
        total: [{ $count: 'n' }],
      },
    },
  ]);

  const produits = await Produit.populate(resultat.produits, [
    { path: 'categorie', select: 'nom slug' },
    { path: 'vendeur',   select: 'nomEntreprise' },
  ]);
  const total = resultat.total[0]?.n ?? 0;

  return { produits, pagination: { total, page, limite, totalPages: Math.ceil(total / limite) } };
}
