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
        .select('nom slug icone image')
        .sort({ ordre: 1, nom: 1 })
        .limit(50)
        .lean(),

      /* Nouveautés : produits en stock les plus récents */
      Produit.find({ statut: 'en_stock', enStock: true })
        .select('nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock')
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      /* Best sellers : produits en stock (logique à enrichir avec les commandes) */
      Produit.find({ statut: 'en_stock', enStock: true })
        .select('nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock')
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ createdAt: 1 })
        .limit(100)
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
