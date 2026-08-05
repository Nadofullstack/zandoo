import Produit from '../../models/Produit.js';
import Vendeur from '../../models/Vendeur.js';

const getVendeurId = async (userId) => {
  const v = await Vendeur.findOne({ utilisateur: userId, statut: 'approuve' }).select('_id');
  return v ? v._id : null;
};

/**
 * GET /api/vendeur/promotions
 * Liste des produits du vendeur avec un prix promotionnel actif.
 */
export const getMesPromotions = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const produits = await Produit.find({
      vendeur: vendeurId,
      prixPromotionnel: { $ne: null, $gt: 0 },
    })
      .select('nom reference prix prixPromotionnel photoCouverture statut')
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: { produits } });
  } catch (erreur) {
    console.error('Erreur getMesPromotions:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * PATCH /api/vendeur/promotions/:produitId
 * Ajoute ou supprime un prix promotionnel sur un produit.
 * Passer prixPromotionnel à null pour supprimer la promotion.
 */
export const gererPromotion = async (req, res) => {
  try {
    const vendeurId = await getVendeurId(req.user._id);
    if (!vendeurId) {
      return res.status(403).json({ success: false, message: 'Boutique non approuvée.' });
    }

    const { prixPromotionnel } = req.body;

    const produit = await Produit.findOne({ _id: req.params.produitId, vendeur: vendeurId });
    if (!produit) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    if (prixPromotionnel === null || prixPromotionnel === undefined || prixPromotionnel === '') {
      produit.prixPromotionnel = null;
    } else {
      const promo = Number(prixPromotionnel);
      if (isNaN(promo) || promo <= 0 || promo >= produit.prix) {
        return res.status(422).json({
          success: false,
          message: 'Le prix promotionnel doit être un nombre positif inférieur au prix normal.',
        });
      }
      produit.prixPromotionnel = promo;
    }

    await produit.save();

    return res.status(200).json({
      success: true,
      message: produit.prixPromotionnel ? 'Promotion appliquée.' : 'Promotion supprimée.',
      data: { produit },
    });
  } catch (erreur) {
    console.error('Erreur gererPromotion:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
