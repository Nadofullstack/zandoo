import mongoose from 'mongoose';
import Favori from '../../models/Favori.js';
import Produit from '../../models/Produit.js';

/** Nombre maximum de favoris par utilisateur (protection contre les abus) */
const MAX_FAVORIS = 500;

/** Champs produit affichés dans la liste des favoris (mêmes que les cartes catalogue) */
const CHAMPS_PRODUIT = 'nom slug photoCouverture variantesPhotos prix prixPromotionnel categorie vendeur enStock statut noteMoyenne nombreAvis';

const erreurServeur = (res, contexte, erreur) => {
  console.error(`Erreur ${contexte}:`, erreur);
  return res.status(500).json({ success: false, message: 'Erreur serveur.' });
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/favoris?page=1&limite=24
   Produits favoris, du plus récent au plus ancien.
   Les produits supprimés depuis sont ignorés (et nettoyés).
───────────────────────────────────────────────────────────────────────────── */
export const getMesFavoris = async (req, res) => {
  try {
    const page   = Math.max(1, Number(req.query.page) || 1);
    const limite = Math.min(48, Math.max(1, Number(req.query.limite) || 24));

    const [favoris, total] = await Promise.all([
      Favori.find({ utilisateur: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limite)
        .limit(limite)
        .populate({
          path: 'produit',
          select: CHAMPS_PRODUIT,
          populate: [
            { path: 'categorie', select: 'nom slug' },
            { path: 'vendeur',   select: 'nomEntreprise' },
          ],
        })
        .lean(),
      Favori.countDocuments({ utilisateur: req.user._id }),
    ]);

    /* Nettoyage best-effort des favoris dont le produit n'existe plus */
    const orphelins = favoris.filter((f) => !f.produit).map((f) => f._id);
    if (orphelins.length) {
      Favori.deleteMany({ _id: { $in: orphelins } }).catch((e) => console.error('Nettoyage favoris:', e.message));
    }

    return res.status(200).json({
      success: true,
      data: {
        produits: favoris.filter((f) => f.produit).map((f) => ({ ...f.produit, ajouteAuxFavorisLe: f.createdAt })),
        pagination: { total, page, limite, totalPages: Math.ceil(total / limite) },
      },
    });
  } catch (erreur) {
    return erreurServeur(res, 'getMesFavoris', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/acheteur/favoris/ids
   Identifiants des produits favoris — pour afficher l'état des cœurs
   sur toutes les cartes produit en une seule requête.
───────────────────────────────────────────────────────────────────────────── */
export const getIdsFavoris = async (req, res) => {
  try {
    const ids = await Favori.find({ utilisateur: req.user._id }).distinct('produit');
    return res.status(200).json({ success: true, data: { ids } });
  } catch (erreur) {
    return erreurServeur(res, 'getIdsFavoris', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   PUT /api/acheteur/favoris/:produitId   (idempotent)
───────────────────────────────────────────────────────────────────────────── */
export const ajouterFavori = async (req, res) => {
  try {
    const { produitId } = req.params;
    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(422).json({ success: false, message: 'Produit invalide.' });
    }

    const [existe, total] = await Promise.all([
      Produit.exists({ _id: produitId }),
      Favori.countDocuments({ utilisateur: req.user._id }),
    ]);
    if (!existe) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    if (total >= MAX_FAVORIS) {
      return res.status(422).json({ success: false, message: `Vous avez atteint la limite de ${MAX_FAVORIS} favoris.` });
    }

    await Favori.updateOne(
      { utilisateur: req.user._id, produit: produitId },
      { $setOnInsert: { utilisateur: req.user._id, produit: produitId } },
      { upsert: true },
    );

    return res.status(200).json({ success: true, message: 'Ajouté à vos favoris.' });
  } catch (erreur) {
    /* Course entre deux requêtes simultanées : l'index unique a déjà fait le travail */
    if (erreur?.code === 11000) return res.status(200).json({ success: true, message: 'Ajouté à vos favoris.' });
    return erreurServeur(res, 'ajouterFavori', erreur);
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   DELETE /api/acheteur/favoris/:produitId   (idempotent)
───────────────────────────────────────────────────────────────────────────── */
export const retirerFavori = async (req, res) => {
  try {
    const { produitId } = req.params;
    if (!mongoose.isValidObjectId(produitId)) {
      return res.status(422).json({ success: false, message: 'Produit invalide.' });
    }

    await Favori.deleteOne({ utilisateur: req.user._id, produit: produitId });
    return res.status(200).json({ success: true, message: 'Retiré de vos favoris.' });
  } catch (erreur) {
    return erreurServeur(res, 'retirerFavori', erreur);
  }
};
