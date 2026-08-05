import Vendeur from '../../models/Vendeur.js';

/**
 * GET /api/vendeur/boutique
 * Retourne les infos de la boutique du vendeur connecté.
 */
export const getBoutique = async (req, res) => {
  try {
    const vendeur = await Vendeur.findOne({ utilisateur: req.user._id }).lean();

    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Boutique introuvable.' });
    }

    return res.status(200).json({ success: true, data: { vendeur } });
  } catch (erreur) {
    console.error('Erreur getBoutique:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * PATCH /api/vendeur/boutique
 * Met à jour les informations de la boutique (logo, bannière, description, etc.).
 */
export const mettreAJourBoutique = async (req, res) => {
  try {
    const champs = [
      'logo', 'banniere', 'descriptionBoutique',
      'nomEntreprise', 'secteurActivite', 'adresse',
      'emailContact', 'telephoneContact',
    ];

    const miseAJour = {};
    for (const champ of champs) {
      if (req.body[champ] !== undefined) {
        miseAJour[champ] = typeof req.body[champ] === 'string'
          ? req.body[champ].trim()
          : req.body[champ];
      }
    }

    const vendeur = await Vendeur.findOneAndUpdate(
      { utilisateur: req.user._id },
      miseAJour,
      { new: true, runValidators: true }
    ).lean();

    if (!vendeur) {
      return res.status(404).json({ success: false, message: 'Boutique introuvable.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Boutique mise à jour.',
      data: { vendeur },
    });
  } catch (erreur) {
    console.error('Erreur mettreAJourBoutique:', erreur);
    return res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
