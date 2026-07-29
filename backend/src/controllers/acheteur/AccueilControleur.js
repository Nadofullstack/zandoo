import Produit from '../../models/Produit.js';
import Categorie from '../../models/Categorie.js';

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/accueil
   Retourne les données de la page d'accueil :
   - catégories racines actives
   - produits vedettes (best sellers / nouveautés approuvés)
   - bannières publicitaires (si le modèle Publicite existe)
───────────────────────────────────────────────────────────────────────────── */
export const getAccueil = async (_req, res) => {
  try {
    const [categories, nouveautes, bestSellers] = await Promise.all([
      /* Catégories racines actives, triées par ordre */
      Categorie.find({ parent: null, active: true })
        .select('nom slug image')
        .sort({ ordre: 1, nom: 1 })
        .limit(10)
        .lean(),

      /* Nouveautés : produits approuvés les plus récents */
      Produit.find({ statut: 'approuve', enStock: true })
        .select('nom slug photos prix prixPromotionnel categorie vendeur')
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      /* Best sellers : produits approuvés les plus anciens (logique à enrichir avec les commandes) */
      Produit.find({ statut: 'approuve', enStock: true })
        .select('nom slug photos prix prixPromotionnel categorie vendeur')
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ createdAt: 1 })
        .limit(8)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: { categories, nouveautes, bestSellers },
    });
  } catch (erreur) {
    console.error('Erreur getAccueil:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
