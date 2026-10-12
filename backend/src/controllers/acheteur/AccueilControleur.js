import Produit from '../../models/Produit.js';
import Categorie from '../../models/Categorie.js';
import mongoose from 'mongoose';
import { getMeilleuresPromotions, getPromotionsPaginees, getPublicitesAccueil } from '../../services/vitrineService.js';

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/accueil
   Retourne les données de la page d'accueil :
   - catégories racines actives
   - produits vedettes (best sellers / nouveautés approuvés)
   - campagnes publicitaires actives (haut et milieu de page)
   - meilleures promotions en cours (triées par remise)
───────────────────────────────────────────────────────────────────────────── */
export const getAccueil = async (_req, res) => {
  try {
    const [categories, nouveautes, bestSellers, publicites, promotions] = await Promise.all([
      /* Catégories racines actives, triées par ordre */
      Categorie.find({ parent: null, active: true })
        .select('nom slug icone image')
        .sort({ ordre: 1, nom: 1 })
        .limit(50)
        .lean(),

      /* Nouveautés : produits en stock et faible stock, les plus récents */
      Produit.find({ statut: { $in: ['en_stock', 'faible'] } })
        .select('nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock statut noteMoyenne nombreAvis')
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      /* Best sellers : produits en stock et faible stock */
      Produit.find({ statut: { $in: ['en_stock', 'faible'] } })
        .select('nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock statut noteMoyenne nombreAvis')
        .populate('categorie', 'nom slug')
        .populate('vendeur', 'nomEntreprise')
        .sort({ createdAt: 1 })
        .limit(100)
        .lean(),

      getPublicitesAccueil(),
      getMeilleuresPromotions(12),
    ]);

    return res.status(200).json({
      success: true,
      data: { categories, nouveautes, bestSellers, publicites, promotions },
    });
  } catch (erreur) {
    console.error('Erreur getAccueil:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/produits/promotions?page=1&tri=remise&categorie=<id>
   Tous les produits en promotion (page « Promotions »).
   tri : remise (défaut) | prix_asc | prix_desc | recent
───────────────────────────────────────────────────────────────────────────── */
export const getPromotions = async (req, res) => {
  try {
    const page      = Math.max(1, Number(req.query.page) || 1);
    const limite    = Math.min(48, Math.max(1, Number(req.query.limite) || 24));
    const categorie = mongoose.isValidObjectId(req.query.categorie)
      ? new mongoose.Types.ObjectId(String(req.query.categorie))
      : undefined;

    const data = await getPromotionsPaginees({ page, limite, tri: req.query.tri, categorie });
    return res.status(200).json({ success: true, data });
  } catch (erreur) {
    console.error('Erreur getPromotions:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
