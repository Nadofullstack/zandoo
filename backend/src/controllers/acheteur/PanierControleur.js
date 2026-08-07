import Panier from '../../models/Panier.js';
import Produit from '../../models/Produit.js';

/**
 * GET /api/acheteur/panier
 * Récupère le panier de l'acheteur connecté avec les détails des produits.
 */
export const getPanier = async (req, res) => {
  try {
    let panier = await Panier.findOne({ acheteur: req.user._id })
      .populate({
        path: 'lignes.produit',
        select: 'nom slug photoCouverture prix prixPromotionnel quantiteDisponible enStock categorie',
        populate: { path: 'categorie', select: 'nom slug' },
      })
      .populate({
        path: 'lignes.vendeur',
        select: 'nomEntreprise logoUrl',
      });

    /* Si aucun panier n'existe, on en crée un vide */
    if (!panier) {
      panier = await Panier.create({
        acheteur: req.user._id,
        lignes: [],
      });
    }

    /* Filtrer les lignes avec produits invalides ou supprimés */
    const lignesValides = panier.lignes.filter((l) => l.produit && l.vendeur);

    /* Calcul du total */
    const total = lignesValides.reduce((acc, ligne) => {
      const produit = ligne.produit;
      const prixUnitaire = produit.prixPromotionnel ?? produit.prix;
      return acc + prixUnitaire * ligne.quantite;
    }, 0);

    return res.json({
      success: true,
      data: {
        panier: {
          _id: panier._id,
          lignes: lignesValides,
          total,
          nombreArticles: lignesValides.reduce((acc, l) => acc + l.quantite, 0),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur getPanier:', erreur);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du panier.',
    });
  }
};

/**
 * POST /api/acheteur/panier
 * Ajoute un produit au panier ou met à jour la quantité.
 */
export const ajouterAuPanier = async (req, res) => {
  try {
    const { produitId, quantite = 1, variante = '' } = req.body;

    if (!produitId) {
      return res.status(422).json({
        success: false,
        message: 'L\'identifiant du produit est requis.',
      });
    }

    if (quantite < 1 || quantite > 99) {
      return res.status(422).json({
        success: false,
        message: 'La quantité doit être comprise entre 1 et 99.',
      });
    }

    /* Vérifier que le produit existe et est disponible */
    const produit = await Produit.findById(produitId).select(
      'nom prix prixPromotionnel quantiteDisponible enStock vendeur statut'
    );

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit introuvable.',
      });
    }

    if (!produit.enStock || produit.statut === 'en_rupture') {
      return res.status(400).json({
        success: false,
        message: 'Ce produit n\'est pas disponible actuellement.',
      });
    }

    if (quantite > produit.quantiteDisponible) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Quantité disponible : ${produit.quantiteDisponible}.`,
      });
    }

    /* Récupérer ou créer le panier */
    let panier = await Panier.findOne({ acheteur: req.user._id });

    if (!panier) {
      panier = await Panier.create({
        acheteur: req.user._id,
        lignes: [],
      });
    }

    /* Vérifier si le produit existe déjà dans le panier (même produit + variante) */
    const indexLigne = panier.lignes.findIndex(
      (l) => l.produit.toString() === produitId && l.variante === variante
    );

    if (indexLigne !== -1) {
      /* Mettre à jour la quantité existante */
      const nouvelleQuantite = panier.lignes[indexLigne].quantite + quantite;

      if (nouvelleQuantite > produit.quantiteDisponible) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant. Quantité disponible : ${produit.quantiteDisponible}.`,
        });
      }

      if (nouvelleQuantite > 99) {
        return res.status(400).json({
          success: false,
          message: 'La quantité maximum par article est de 99.',
        });
      }

      panier.lignes[indexLigne].quantite = nouvelleQuantite;
    } else {
      /* Ajouter une nouvelle ligne */
      panier.lignes.push({
        produit: produitId,
        vendeur: produit.vendeur,
        quantite,
        variante,
      });
    }

    await panier.save();

    /* Recharger le panier avec les détails des produits */
    panier = await Panier.findById(panier._id)
      .populate({
        path: 'lignes.produit',
        select: 'nom slug photoCouverture prix prixPromotionnel quantiteDisponible enStock categorie',
        populate: { path: 'categorie', select: 'nom slug' },
      })
      .populate({
        path: 'lignes.vendeur',
        select: 'nomEntreprise logoUrl',
      });

    const lignesValides = panier.lignes.filter((l) => l.produit && l.vendeur);
    const total = lignesValides.reduce((acc, ligne) => {
      const prod = ligne.produit;
      const prixUnitaire = prod.prixPromotionnel ?? prod.prix;
      return acc + prixUnitaire * ligne.quantite;
    }, 0);

    return res.status(201).json({
      success: true,
      message: 'Produit ajouté au panier avec succès.',
      data: {
        panier: {
          _id: panier._id,
          lignes: lignesValides,
          total,
          nombreArticles: lignesValides.reduce((acc, l) => acc + l.quantite, 0),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur ajouterAuPanier:', erreur);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout au panier.',
    });
  }
};

/**
 * PUT /api/acheteur/panier/:ligneId
 * Met à jour la quantité d'une ligne du panier.
 */
export const modifierQuantite = async (req, res) => {
  try {
    const { ligneId } = req.params;
    const { quantite } = req.body;

    if (!quantite || quantite < 1 || quantite > 99) {
      return res.status(422).json({
        success: false,
        message: 'La quantité doit être comprise entre 1 et 99.',
      });
    }

    const panier = await Panier.findOne({ acheteur: req.user._id });

    if (!panier) {
      return res.status(404).json({
        success: false,
        message: 'Panier introuvable.',
      });
    }

    const ligne = panier.lignes.id(ligneId);

    if (!ligne) {
      return res.status(404).json({
        success: false,
        message: 'Article introuvable dans le panier.',
      });
    }

    /* Vérifier le stock disponible */
    const produit = await Produit.findById(ligne.produit).select('quantiteDisponible enStock statut');

    if (!produit || !produit.enStock || produit.statut === 'en_rupture') {
      return res.status(400).json({
        success: false,
        message: 'Ce produit n\'est plus disponible.',
      });
    }

    if (quantite > produit.quantiteDisponible) {
      return res.status(400).json({
        success: false,
        message: `Stock insuffisant. Quantité disponible : ${produit.quantiteDisponible}.`,
      });
    }

    ligne.quantite = quantite;
    await panier.save();

    /* Recharger le panier avec les détails */
    const panierRecharge = await Panier.findById(panier._id)
      .populate({
        path: 'lignes.produit',
        select: 'nom slug photoCouverture prix prixPromotionnel quantiteDisponible enStock categorie',
        populate: { path: 'categorie', select: 'nom slug' },
      })
      .populate({
        path: 'lignes.vendeur',
        select: 'nomEntreprise logoUrl',
      });

    const lignesValides = panierRecharge.lignes.filter((l) => l.produit && l.vendeur);
    const total = lignesValides.reduce((acc, l) => {
      const prod = l.produit;
      const prixUnitaire = prod.prixPromotionnel ?? prod.prix;
      return acc + prixUnitaire * l.quantite;
    }, 0);

    return res.json({
      success: true,
      message: 'Quantité mise à jour avec succès.',
      data: {
        panier: {
          _id: panierRecharge._id,
          lignes: lignesValides,
          total,
          nombreArticles: lignesValides.reduce((acc, l) => acc + l.quantite, 0),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur modifierQuantite:', erreur);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la quantité.',
    });
  }
};

/**
 * DELETE /api/acheteur/panier/:ligneId
 * Supprime une ligne du panier.
 */
export const retirerDuPanier = async (req, res) => {
  try {
    const { ligneId } = req.params;

    const panier = await Panier.findOne({ acheteur: req.user._id });

    if (!panier) {
      return res.status(404).json({
        success: false,
        message: 'Panier introuvable.',
      });
    }

    const ligne = panier.lignes.id(ligneId);

    if (!ligne) {
      return res.status(404).json({
        success: false,
        message: 'Article introuvable dans le panier.',
      });
    }

    /* Retirer la ligne (Mongoose 7+ syntax) */
    ligne.deleteOne();
    await panier.save();

    /* Recharger le panier avec les détails */
    const panierRecharge = await Panier.findById(panier._id)
      .populate({
        path: 'lignes.produit',
        select: 'nom slug photoCouverture prix prixPromotionnel quantiteDisponible enStock categorie',
        populate: { path: 'categorie', select: 'nom slug' },
      })
      .populate({
        path: 'lignes.vendeur',
        select: 'nomEntreprise logoUrl',
      });

    const lignesValides = panierRecharge.lignes.filter((l) => l.produit && l.vendeur);
    const total = lignesValides.reduce((acc, l) => {
      const prod = l.produit;
      const prixUnitaire = prod.prixPromotionnel ?? prod.prix;
      return acc + prixUnitaire * l.quantite;
    }, 0);

    return res.json({
      success: true,
      message: 'Article retiré du panier avec succès.',
      data: {
        panier: {
          _id: panierRecharge._id,
          lignes: lignesValides,
          total,
          nombreArticles: lignesValides.reduce((acc, l) => acc + l.quantite, 0),
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur retirerDuPanier:', erreur);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'article.',
    });
  }
};

/**
 * DELETE /api/acheteur/panier
 * Vide complètement le panier.
 */
export const viderPanier = async (req, res) => {
  try {
    const panier = await Panier.findOne({ acheteur: req.user._id });

    if (!panier) {
      return res.status(404).json({
        success: false,
        message: 'Panier introuvable.',
      });
    }

    panier.lignes = [];
    await panier.save();

    return res.json({
      success: true,
      message: 'Panier vidé avec succès.',
      data: {
        panier: {
          _id: panier._id,
          lignes: [],
          total: 0,
          nombreArticles: 0,
        },
      },
    });
  } catch (erreur) {
    console.error('Erreur viderPanier:', erreur);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du panier.',
    });
  }
};
