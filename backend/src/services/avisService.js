import mongoose from 'mongoose';
import Avis from '../models/Avis.js';
import Produit from '../models/Produit.js';
import Commande from '../models/Commande.js';

/**
 * Logique métier des avis clients (partagée acheteur / vendeur / admin / public).
 */

/** Recalcule et enregistre la note moyenne et le nombre d'avis publiés d'un produit. */
export async function recalculerNoteProduit(produitId) {
  const [stats] = await Avis.aggregate([
    { $match: { produit: new mongoose.Types.ObjectId(String(produitId)), statut: 'publie' } },
    { $group: { _id: null, moyenne: { $avg: '$note' }, total: { $sum: 1 } } },
  ]);

  await Produit.updateOne(
    { _id: produitId },
    {
      noteMoyenne: stats ? Math.round(stats.moyenne * 10) / 10 : 0,
      nombreAvis:  stats?.total ?? 0,
    },
  );
}

/** Version best-effort : un échec de recalcul ne doit pas faire échouer l'action de l'utilisateur. */
export const recalculerNoteProduitSansErreur = (produitId) =>
  recalculerNoteProduit(produitId).catch((e) => console.error('Recalcul note produit:', e.message));

/**
 * Commande livrée de l'acheteur contenant ce produit (la plus récente), ou null.
 * C'est la preuve d'achat exigée pour publier un avis.
 */
export function trouverCommandeLivree(acheteurId, produitId) {
  return Commande.findOne(
    { acheteur: acheteurId, statut: 'livree', 'lignes.produit': produitId },
    { _id: 1, vendeur: 1 },
  ).sort({ livreeAt: -1, createdAt: -1 }).lean();
}

/**
 * Répartition des notes publiées d'un produit : { moyenne, total, repartition: {1..5} }.
 */
export async function resumeNotesProduit(produitId) {
  const groupes = await Avis.aggregate([
    { $match: { produit: new mongoose.Types.ObjectId(String(produitId)), statut: 'publie' } },
    { $group: { _id: '$note', n: { $sum: 1 } } },
  ]);

  const repartition = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  groupes.forEach((g) => { repartition[g._id] = g.n; });
  const total = groupes.reduce((s, g) => s + g.n, 0);
  const somme = groupes.reduce((s, g) => s + g._id * g.n, 0);

  return { moyenne: total ? Math.round((somme / total) * 10) / 10 : 0, total, repartition };
}

/** Nom public d'un auteur : « Prénom N. » (protection de la vie privée). */
export const nomPublic = (fullName = '') => {
  const [prenom, ...reste] = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (!prenom) return 'Client';
  const initiale = reste.length ? ` ${reste.at(-1)[0].toUpperCase()}.` : '';
  return `${prenom}${initiale}`;
};

/** Forme publique d'un avis (aucune donnée personnelle hormis le nom abrégé). */
export const versAvisPublic = (avis) => ({
  _id:            avis._id,
  note:           avis.note,
  titre:          avis.titre,
  commentaire:    avis.commentaire,
  auteur:         nomPublic(avis.acheteur?.fullName),
  achatVerifie:   true,
  createdAt:      avis.createdAt,
  modifie:        !!avis.modifieAt,
  reponseVendeur: avis.reponseVendeur?.texte ? avis.reponseVendeur : null,
});
